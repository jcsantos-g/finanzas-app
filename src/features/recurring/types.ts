import type { MovimientoRecurrente } from '@/types/database';

export type RecurringExpenseInput = Pick<
  MovimientoRecurrente,
  'categoria_id' | 'monto_esperado' | 'frecuencia' | 'fecha_inicio' | 'proxima_fecha' | 'descripcion'
>;

export type RecurringExpenseUpdate = Pick<
  MovimientoRecurrente,
  'categoria_id' | 'monto_esperado' | 'frecuencia' | 'descripcion'
>;

export type RecurringExpenseAction = 'confirmar' | 'omitir';
