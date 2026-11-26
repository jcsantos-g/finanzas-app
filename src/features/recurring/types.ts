import type { MovimientoRecurrente } from '@/types/database';

export type RecurringInput = Pick<
  MovimientoRecurrente,
  'tipo' | 'categoria_id' | 'monto_esperado' | 'frecuencia' | 'fecha_inicio' | 'proxima_fecha' | 'descripcion'
>;

/** El tipo y la fecha de inicio no cambian al editar una programación. */
export type RecurringUpdate = Pick<
  MovimientoRecurrente,
  'categoria_id' | 'monto_esperado' | 'frecuencia' | 'descripcion'
>;

export type RecurringAction = 'confirmar' | 'omitir';
