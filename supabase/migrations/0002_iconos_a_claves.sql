-- =============================================================================
-- 0002_iconos_a_claves.sql — Cambia los emojis de las categorías por claves de ícono
--
-- CUÁNDO EJECUTARLO
--   Solo si ya ejecutaste 0001_init.sql ANTES de este cambio (cuando las categorías
--   iniciales usaban emojis). Si tu 0001 ya trae claves ('alimentacion', etc.),
--   este script no hace nada dañino: se puede ejecutar igual.
--
-- QUÉ HACE
--   1. Reemplaza en las categorías existentes cada emoji por su clave de ícono.
--   2. Actualiza la función que crea las categorías de los usuarios NUEVOS.
--   3. Actualiza la descripción (COMMENT) de la columna.
--
-- POR QUÉ
--   Los emojis se ven distinto en cada dispositivo y no se pueden tematizar.
--   Ahora la base guarda una clave y la app dibuja un ícono vectorial
--   (catálogo: src/components/ui/iconCatalog.ts).
-- =============================================================================

-- 1. Convertir emojis existentes en claves (las categorías sin emoji conocido no se tocan).
update public.categorias set icono = case icono
  when '💼'  then 'salario'
  when '🏪'  then 'negocio'
  when '🎁'  then 'regalos'
  when '➕'  then 'otros_ingresos'
  when '🍽️' then 'alimentacion'
  when '🚌'  then 'transporte'
  when '🏠'  then 'vivienda'
  when '💡'  then 'servicios'
  when '🩺'  then 'salud'
  when '📚'  then 'educacion'
  when '🎬'  then 'entretenimiento'
  when '➖'  then 'otros_gastos'
  else icono
end
where icono in ('💼','🏪','🎁','➕','🍽️','🚌','🏠','💡','🩺','📚','🎬','➖');

-- 2. Categorías iniciales de usuarios nuevos, ahora con claves.
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

-- 3. Descripción de la columna.
comment on column public.categorias.icono is
  'Clave del ícono (ej. alimentacion). La app la traduce a un ícono vectorial; ver CATEGORY_ICONS en src/components/ui/iconCatalog.ts. Opcional.';
