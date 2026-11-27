import type { MovimientoRecurrente } from '@/types/database';

export type RecurringMovementInput = Pick<
  MovimientoRecurrente,
  'tipo' | 'categoria_id' | 'monto_esperado' | 'frecuencia' | 'fecha_inicio' | 'proxima_fecha' | 'descripcion'
>;

export type RecurringMovementUpdate = Pick<
  MovimientoRecurrente,
  'categoria_id' | 'monto_esperado' | 'frecuencia' | 'descripcion'
>;

export type RecurringMovementAction = 'confirmar' | 'omitir';
