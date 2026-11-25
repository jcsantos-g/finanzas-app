-- =============================================================================
-- 0001_init.sql — Esquema inicial de Finanzas Personales (todo en español)
--
-- CÓMO EJECUTARLO
--   Supabase Dashboard -> SQL Editor -> New query -> pegar TODO este archivo -> Run.
--   Debe ejecutarse una sola vez sobre un proyecto vacío. Si falla a la mitad,
--   usa el bloque "REINICIO" del final de este archivo y vuelve a ejecutarlo.
--
-- QUÉ CREA
--   1 función auxiliar + 4 tablas + índices + seguridad por usuario (RLS)
--   + un disparador que crea categorías iniciales a cada usuario nuevo.
--
-- GLOSARIO RÁPIDO
--   Tabla ........... conjunto de filas con las mismas columnas (como una hoja de cálculo).
--   Llave primaria .. columna (o grupo) que identifica de forma única cada fila.
--   Llave foránea ... columna que apunta a una fila de otra tabla (relación entre tablas).
--   CHECK ........... regla que la base exige siempre (ej. monto > 0).
--   Índice .......... "índice de libro": acelera consultas o impide valores repetidos (único).
--   RLS ............. Row Level Security: cada usuario solo ve y modifica SUS filas.
--   Disparador ...... código que la base ejecuta sola cuando ocurre un evento (insertar, actualizar).
--
-- Dueño: Integrante 1. No modificar tablas sin coordinar (ver CLAUDE.md).
-- Explicación de las decisiones de diseño: docs/database.md
-- =============================================================================


-- =============================================================================
-- 1. FUNCIÓN AUXILIAR: actualizar_actualizado_en
-- Qué es: una función que escribe la fecha y hora actual en la columna "actualizado_en".
-- Para qué sirve: los disparadores de abajo la llaman cada vez que se edita una fila,
--                 así siempre sabemos cuándo se modificó por última vez.
-- =============================================================================
create or replace function public.actualizar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;


-- =============================================================================
-- 2. TABLA categorias
-- Qué es: lista de categorías con las que se clasifican los movimientos
--         (ej. "Alimentación" para gastos, "Salario" para ingresos).
-- Para qué sirve: cada ingreso, gasto, recurrente y presupuesto apunta a una categoría.
-- Cada usuario tiene sus propias categorías (se crean solas al registrarse, ver sección 7).
-- =============================================================================
create table public.categorias (
  -- Identificador único de la categoría (se genera solo).
  id         uuid primary key default gen_random_uuid(),
  -- Dueño de la categoría. "default auth.uid()" = el usuario que está conectado,
  -- así la app no necesita enviarlo (y nadie puede falsificarlo).
  -- "on delete cascade" = si se borra el usuario, se borran sus categorías.
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Nombre visible, entre 1 y 60 caracteres (se ignoran espacios sobrantes).
  nombre     text not null check (char_length(btrim(nombre)) between 1 and 60),
  -- A qué tipo de movimiento aplica: solo 'ingreso' o 'gasto'.
  tipo       text not null check (tipo in ('ingreso', 'gasto')),
  -- Clave del ícono (ej. 'alimentacion'); la app la traduce a un ícono vectorial (opcional).
  icono      text,
  -- Estas dos restricciones "únicas" cumplen funciones distintas:
  -- (1) permite que otras tablas verifiquen dueño y tipo de la categoría con una sola llave foránea;
  unique (id, usuario_id, tipo),
  -- (2) impide que un usuario tenga dos categorías con el mismo nombre y tipo.
  unique (usuario_id, tipo, nombre)
);


-- =============================================================================
-- 3. TABLA movimientos_recurrentes
-- Qué es: la "programación" de ingresos o gastos que se repiten (renta, sueldo, suscripciones).
-- Para qué sirve: cuando llega su fecha aparecen como pendientes; el usuario decide si
--                 los confirma (se crea un movimiento real) u omite. Mientras estén
--                 pendientes NO afectan el dinero disponible (RN-05).
-- =============================================================================
create table public.movimientos_recurrentes (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Categoría a la que pertenece (se verifica abajo con la llave foránea compuesta).
  categoria_id    uuid not null,
  tipo            text not null check (tipo in ('ingreso', 'gasto')),
  -- Monto que se espera; debe ser mayor que cero (RN-02).
  -- numeric(12,2) = hasta 12 dígitos con 2 decimales, exacto (a diferencia de float, que redondea mal).
  monto_esperado  numeric(12, 2) not null check (monto_esperado > 0),
  -- Cada cuánto se repite.
  frecuencia      text not null check (frecuencia in ('semanal', 'quincenal', 'mensual')),
  -- Primera fecha en que ocurre.
  fecha_inicio    date not null,
  -- Próxima fecha pendiente. Se recalcula al confirmar u omitir (RN-06, RN-07, RN-09).
  proxima_fecha   date not null,
  descripcion     text,
  -- false = programación pausada (no genera pendientes).
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  -- La próxima fecha nunca puede ser anterior a la fecha de inicio.
  check (proxima_fecha >= fecha_inicio),
  -- Llave foránea compuesta: la categoría debe ser del MISMO usuario y del MISMO tipo.
  -- Así es imposible usar la categoría de otra persona o poner un gasto en una categoría de ingresos.
  foreign key (categoria_id, usuario_id, tipo)
    references public.categorias (id, usuario_id, tipo),
  -- Necesario para que "movimientos" pueda referenciar esta tabla verificando el dueño.
  unique (id, usuario_id)
);

-- Disparador: al editar una fila, actualiza "actualizado_en" automáticamente.
create trigger movimientos_recurrentes_actualizado_en
  before update on public.movimientos_recurrentes
  for each row execute function public.actualizar_actualizado_en();


-- =============================================================================
-- 4. TABLA movimientos
-- Qué es: TODOS los ingresos y gastos que realmente ocurrieron (RN-03: una sola estructura).
-- Para qué sirve: es la tabla principal. De aquí se calculan el dinero disponible,
--                 los presupuestos usados y los reportes. Esos totales NO se guardan:
--                 se calculan al consultar, así nunca quedan desactualizados.
-- =============================================================================
create table public.movimientos (
  id                       uuid primary key default gen_random_uuid(),
  usuario_id               uuid not null default auth.uid() references auth.users (id) on delete cascade,
  categoria_id             uuid not null,
  tipo                     text not null check (tipo in ('ingreso', 'gasto')),
  -- Monto real; debe ser mayor que cero (RN-02).
  monto                    numeric(12, 2) not null check (monto > 0),
  -- Fecha en que ocurrió el movimiento (por defecto, hoy).
  fecha                    date not null default current_date,
  descripcion              text,
  -- Comercio o lugar (útil sobre todo con el escaneo de tickets).
  establecimiento          text,
  -- Cómo se creó: a mano, al confirmar un recurrente, o con IA (escáner de tickets).
  origen                   text not null default 'manual' check (origen in ('manual', 'recurrente', 'ia')),
  -- Si viene de un recurrente: cuál programación y para qué fecha estaba programado.
  -- "on delete set null" = si se borra la programación, el movimiento se conserva (solo pierde el vínculo).
  movimiento_recurrente_id uuid,
  fecha_programada         date,
  creado_en                timestamptz not null default now(),
  actualizado_en           timestamptz not null default now(),
  -- Si el origen es 'recurrente', es obligatorio indicar de qué programación y fecha viene.
  check (origen <> 'recurrente' or (movimiento_recurrente_id is not null and fecha_programada is not null)),
  -- La categoría debe ser del mismo usuario y del mismo tipo que el movimiento.
  foreign key (categoria_id, usuario_id, tipo)
    references public.categorias (id, usuario_id, tipo),
  -- La programación (si existe) debe ser del mismo usuario.
  foreign key (movimiento_recurrente_id, usuario_id)
    references public.movimientos_recurrentes (id, usuario_id) on delete set null (movimiento_recurrente_id)
);

-- ÍNDICE ÚNICO ANTI-DUPLICADOS: una misma ocurrencia de un recurrente solo puede
-- confirmarse una vez, aunque el usuario toque "confirmar" dos veces seguidas.
create unique index movimientos_una_vez_por_ocurrencia
  on public.movimientos (movimiento_recurrente_id, fecha_programada)
  where movimiento_recurrente_id is not null and fecha_programada is not null;

-- ÍNDICES DE VELOCIDAD: aceleran los listados y reportes (filtran por usuario, fecha y tipo).
create index movimientos_usuario_fecha_idx      on public.movimientos (usuario_id, fecha desc);
create index movimientos_usuario_tipo_fecha_idx on public.movimientos (usuario_id, tipo, fecha desc);

create trigger movimientos_actualizado_en
  before update on public.movimientos
  for each row execute function public.actualizar_actualizado_en();


-- =============================================================================
-- 5. TABLA presupuestos
-- Qué es: límites de gasto mensuales que define el usuario.
-- Para qué sirve: la app compara lo gastado en el mes contra el límite
--                 (monto usado, restante y porcentaje se calculan, no se guardan).
-- Un presupuesto GENERAL (categoria_id vacío) y uno por categoría, por mes.
-- =============================================================================
create table public.presupuestos (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Vacío (NULL) = presupuesto general del mes. Con valor = presupuesto de esa categoría.
  -- "on delete cascade" = si se borra la categoría, se borra su presupuesto.
  categoria_id uuid references public.categorias (id) on delete cascade,
  -- Límite de gasto; debe ser mayor que cero.
  monto_limite numeric(12, 2) not null check (monto_limite > 0),
  -- Mes al que aplica, siempre guardado como el día 1 (ej. 2026-03-01 = marzo 2026).
  mes          date not null check (mes = date_trunc('month', mes)::date),
  creado_en    timestamptz not null default now()
);

-- Máximo un presupuesto general por mes y uno por categoría por mes.
-- Son DOS índices porque en un índice único los valores vacíos (NULL) no se comparan entre sí.
create unique index presupuestos_general_por_mes
  on public.presupuestos (usuario_id, mes) where categoria_id is null;
create unique index presupuestos_categoria_por_mes
  on public.presupuestos (usuario_id, mes, categoria_id) where categoria_id is not null;


-- =============================================================================
-- 6. SEGURIDAD POR USUARIO (RLS) — RN-01 y RN-14
-- Qué es: Row Level Security. Se activa por tabla y se definen "políticas".
-- Para qué sirve: aunque alguien conozca la dirección de la API, cada usuario solo puede
--                 leer, crear, editar o borrar filas cuyo usuario_id sea el suyo.
--                 La protección vive en la base de datos, no depende del código de la app.
-- "(select auth.uid())" = id del usuario conectado (escrito así para que sea más rápido).
-- =============================================================================
alter table public.categorias              enable row level security;
alter table public.movimientos             enable row level security;
alter table public.movimientos_recurrentes enable row level security;
alter table public.presupuestos            enable row level security;

-- "using" filtra lo que se puede VER/EDITAR/BORRAR; "with check" valida lo que se puede GUARDAR.
create policy "categorias: solo el dueño" on public.categorias
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "movimientos: solo el dueño" on public.movimientos
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "movimientos_recurrentes: solo el dueño" on public.movimientos_recurrentes
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "presupuestos: solo el dueño" on public.presupuestos
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));


-- =============================================================================
-- 7. CATEGORÍAS INICIALES PARA CADA USUARIO NUEVO
-- Qué es: una función + un disparador sobre la tabla de usuarios de Supabase (auth.users).
-- Para qué sirve: cuando alguien se registra, recibe automáticamente 12 categorías
--                 (4 de ingreso y 8 de gasto) para empezar a usar la app sin configurar nada.
-- "security definer" = la función se ejecuta con permisos de administrador, porque el usuario
--                      recién creado todavía no tiene sesión para insertar por sí mismo.
-- =============================================================================
create or replace function public.crear_categorias_iniciales()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categorias (usuario_id, nombre, tipo, icono) values
    (new.id, 'Salario',          'ingreso', 'salario'),
    (new.id, 'Negocio',          'ingreso', 'negocio'),
    (new.id, 'Regalos',          'ingreso', 'regalos'),
    (new.id, 'Otros ingresos',   'ingreso', 'otros_ingresos'),
    (new.id, 'Alimentación',     'gasto',   'alimentacion'),
    (new.id, 'Transporte',       'gasto',   'transporte'),
    (new.id, 'Vivienda',         'gasto',   'vivienda'),
    (new.id, 'Servicios',        'gasto',   'servicios'),
    (new.id, 'Salud',            'gasto',   'salud'),
    (new.id, 'Educación',        'gasto',   'educacion'),
    (new.id, 'Entretenimiento',  'gasto',   'entretenimiento'),
    (new.id, 'Otros gastos',     'gasto',   'otros_gastos');
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_categorias_iniciales();


-- =============================================================================
-- 8. DESCRIPCIONES (COMMENT ON)
-- Qué es: documentación guardada DENTRO de la base de datos (como en MySQL).
-- Para qué sirve: aparece en Supabase -> Table Editor / Database -> Tables,
--                 junto a cada tabla y columna, para que cualquiera entienda su propósito.
-- =============================================================================
comment on table public.categorias is
  'Categorías para clasificar ingresos y gastos. Cada usuario tiene las suyas (se crean al registrarse).';
comment on column public.categorias.id         is 'Identificador único de la categoría.';
comment on column public.categorias.usuario_id is 'Dueño de la categoría (usuario de Supabase Auth).';
comment on column public.categorias.nombre     is 'Nombre visible, por ejemplo "Alimentación".';
comment on column public.categorias.tipo       is 'A qué aplica: ingreso o gasto.';
comment on column public.categorias.icono      is 'Clave del ícono (ej. alimentacion). La app la traduce a un ícono vectorial; ver CATEGORY_ICONS en src/components/ui/iconCatalog.ts. Opcional.';

comment on table public.movimientos_recurrentes is
  'Programaciones de ingresos/gastos que se repiten. Mientras están pendientes NO afectan saldo ni presupuestos; al confirmarse generan un registro en movimientos.';
comment on column public.movimientos_recurrentes.id             is 'Identificador único de la programación.';
comment on column public.movimientos_recurrentes.usuario_id     is 'Dueño de la programación.';
comment on column public.movimientos_recurrentes.categoria_id   is 'Categoría del movimiento (del mismo usuario y tipo).';
comment on column public.movimientos_recurrentes.tipo           is 'ingreso o gasto.';
comment on column public.movimientos_recurrentes.monto_esperado is 'Monto que se espera; el monto real puede ajustarse al confirmar. Mayor que cero.';
comment on column public.movimientos_recurrentes.frecuencia     is 'Periodicidad: semanal, quincenal o mensual.';
comment on column public.movimientos_recurrentes.fecha_inicio   is 'Primera fecha programada.';
comment on column public.movimientos_recurrentes.proxima_fecha  is 'Próxima fecha pendiente; se calcula desde la fecha programada anterior (RN-09).';
comment on column public.movimientos_recurrentes.descripcion    is 'Descripción opcional.';
comment on column public.movimientos_recurrentes.activo         is 'false = programación pausada.';
comment on column public.movimientos_recurrentes.creado_en      is 'Fecha y hora de creación.';
comment on column public.movimientos_recurrentes.actualizado_en is 'Fecha y hora de la última modificación (automática).';

comment on table public.movimientos is
  'Ingresos y gastos que realmente ocurrieron. Base de todos los cálculos: dinero disponible, presupuestos y reportes.';
comment on column public.movimientos.id                       is 'Identificador único del movimiento.';
comment on column public.movimientos.usuario_id               is 'Dueño del movimiento.';
comment on column public.movimientos.categoria_id             is 'Categoría (del mismo usuario y tipo).';
comment on column public.movimientos.tipo                     is 'ingreso o gasto.';
comment on column public.movimientos.monto                    is 'Monto real, mayor que cero.';
comment on column public.movimientos.fecha                    is 'Fecha en que ocurrió el movimiento.';
comment on column public.movimientos.descripcion              is 'Descripción opcional.';
comment on column public.movimientos.establecimiento          is 'Comercio o lugar (opcional).';
comment on column public.movimientos.origen                   is 'Cómo se creó: manual, recurrente (al confirmar una programación) o ia (escáner de tickets).';
comment on column public.movimientos.movimiento_recurrente_id is 'Programación de origen, si viene de un recurrente.';
comment on column public.movimientos.fecha_programada         is 'Fecha para la que estaba programado, si viene de un recurrente.';
comment on column public.movimientos.creado_en                is 'Fecha y hora de creación.';
comment on column public.movimientos.actualizado_en           is 'Fecha y hora de la última modificación (automática).';

comment on table public.presupuestos is
  'Límites de gasto mensuales: uno general y uno por categoría, por mes. Lo usado y lo restante se calculan, no se guardan.';
comment on column public.presupuestos.id           is 'Identificador único del presupuesto.';
comment on column public.presupuestos.usuario_id   is 'Dueño del presupuesto.';
comment on column public.presupuestos.categoria_id is 'Categoría del presupuesto; vacío = presupuesto general del mes.';
comment on column public.presupuestos.monto_limite is 'Límite de gasto, mayor que cero.';
comment on column public.presupuestos.mes          is 'Mes al que aplica, guardado como el día 1 (ej. 2026-03-01).';
comment on column public.presupuestos.creado_en    is 'Fecha y hora de creación.';


-- =============================================================================
-- REINICIO (SOLO DESARROLLO) — BORRA TODOS LOS DATOS
-- Si este script falló a la mitad y quieres empezar de cero, quita los "--" de las
-- líneas siguientes, ejecútalas SOLAS, vuelve a comentarlas y ejecuta el archivo completo.
-- =============================================================================
-- drop trigger if exists al_crear_usuario on auth.users;
-- drop function if exists public.crear_categorias_iniciales();
-- drop table if exists public.presupuestos, public.movimientos, public.movimientos_recurrentes, public.categorias cascade;
-- drop function if exists public.actualizar_actualizado_en();
