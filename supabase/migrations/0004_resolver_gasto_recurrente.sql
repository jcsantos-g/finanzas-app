-- Confirma u omite una ocurrencia de gasto y avanza su fecha en una transacción.
create or replace function public.resolver_gasto_recurrente(
  p_movimiento_recurrente_id uuid,
  p_fecha_programada date,
  p_proxima_fecha date,
  p_accion text,
  p_monto numeric,
  p_fecha_real date
)
returns date
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_schedule public.movimientos_recurrentes%rowtype;
  v_expected_next_date date;
  v_target_month date;
  v_last_day integer;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión iniciada.';
  end if;

  if p_accion is null or p_accion not in ('confirmar', 'omitir') then
    raise exception 'La acción debe ser confirmar u omitir.';
  end if;

  if p_fecha_programada is null or p_proxima_fecha is null then
    raise exception 'Las fechas de la ocurrencia son obligatorias.';
  end if;

  select *
    into v_schedule
    from public.movimientos_recurrentes
   where id = p_movimiento_recurrente_id
     and usuario_id = (select auth.uid())
     and tipo = 'gasto'
     and activo
   for update;

  if not found then
    raise exception 'No se encontró un gasto recurrente activo para este usuario.';
  end if;

  if v_schedule.proxima_fecha <> p_fecha_programada then
    raise exception 'La ocurrencia ya fue resuelta o la programación cambió. Actualiza la pantalla.';
  end if;

  if v_schedule.frecuencia = 'semanal' then
    v_expected_next_date := p_fecha_programada + 7;
  elsif v_schedule.frecuencia = 'quincenal' then
    v_expected_next_date := p_fecha_programada + 14;
  else
    v_target_month := date_trunc('month', p_fecha_programada + interval '1 month')::date;
    v_last_day := extract(day from ((v_target_month + interval '1 month')::date - 1))::integer;
    v_expected_next_date :=
      v_target_month + least(extract(day from v_schedule.fecha_inicio)::integer, v_last_day) - 1;
  end if;

  if p_proxima_fecha <> v_expected_next_date then
    raise exception 'La siguiente fecha no coincide con la frecuencia programada.';
  end if;

  if p_accion = 'confirmar' then
    if p_monto is null or p_monto <= 0 or p_fecha_real is null then
      raise exception 'Para confirmar se requiere un monto mayor que cero y la fecha real.';
    end if;

    insert into public.movimientos (
      usuario_id,
      categoria_id,
      tipo,
      monto,
      fecha,
      descripcion,
      origen,
      movimiento_recurrente_id,
      fecha_programada
    )
    values (
      v_schedule.usuario_id,
      v_schedule.categoria_id,
      'gasto',
      p_monto,
      p_fecha_real,
      v_schedule.descripcion,
      'recurrente',
      v_schedule.id,
      p_fecha_programada
    );
  end if;

  update public.movimientos_recurrentes
     set proxima_fecha = p_proxima_fecha
   where id = v_schedule.id
     and usuario_id = v_schedule.usuario_id;

  return p_proxima_fecha;
end;
$$;

revoke all on function public.resolver_gasto_recurrente(uuid, date, date, text, numeric, date) from public, anon;
grant execute on function public.resolver_gasto_recurrente(uuid, date, date, text, numeric, date) to authenticated;

comment on function public.resolver_gasto_recurrente(uuid, date, date, text, numeric, date) is
  'Confirma u omite una ocurrencia de gasto recurrente, validando la fecha y avanzando la programación de forma atómica.';
