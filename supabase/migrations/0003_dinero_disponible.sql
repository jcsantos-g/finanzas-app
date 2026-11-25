-- =============================================================================
-- 0003_dinero_disponible.sql — Función que calcula el dinero disponible (RF-06)
--
-- CÓMO EJECUTARLO
--   Supabase Dashboard -> SQL Editor -> New query -> pegar -> Run.
--   Requiere haber ejecutado antes 0001_init.sql. Se puede ejecutar más de una vez.
--
-- QUÉ ES
--   Una función que devuelve: suma de ingresos - suma de gastos del usuario conectado.
--
-- PARA QUÉ SIRVE
--   La app muestra ese saldo sin descargar todos los movimientos. Si sumara en el
--   teléfono, con muchos registros el resultado saldría incompleto, porque Supabase
--   devuelve como máximo 1000 filas por consulta.
--
-- REGLAS QUE CUMPLE
--   RN-11: solo usa movimientos reales (tabla "movimientos"). Los recurrentes
--          pendientes viven en otra tabla y por eso no cuentan.
--   RN-14: "security invoker" = la función respeta RLS, así que cada usuario
--          solo suma SUS movimientos.
--   El saldo NO se guarda: se calcula cada vez, así nunca queda desactualizado.
-- =============================================================================
create or replace function public.dinero_disponible()
returns numeric
language sql
stable                 -- solo lee datos, no los modifica
security invoker       -- se ejecuta con los permisos de quien la llama (aplica RLS)
set search_path = public
as $$
  select coalesce(sum(case when tipo = 'ingreso' then monto else -monto end), 0)
  from public.movimientos
  where usuario_id = (select auth.uid());
$$;

-- Solo los usuarios con sesión iniciada pueden llamarla.
revoke execute on function public.dinero_disponible() from public, anon;
grant execute on function public.dinero_disponible() to authenticated;

comment on function public.dinero_disponible() is
  'Dinero disponible del usuario conectado: ingresos menos gastos reales (RF-06). Respeta RLS.';
