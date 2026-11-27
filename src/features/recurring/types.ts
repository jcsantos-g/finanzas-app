import type { MovimientoRecurrente } from '@/types/database';

<<<<<<< HEAD
export type RecurringMovementInput = Pick<
=======
export type RecurringInput = Pick<
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  MovimientoRecurrente,
  'tipo' | 'categoria_id' | 'monto_esperado' | 'frecuencia' | 'fecha_inicio' | 'proxima_fecha' | 'descripcion'
>;

<<<<<<< HEAD
export type RecurringMovementUpdate = Pick<
=======
/** El tipo y la fecha de inicio no cambian al editar una programación. */
export type RecurringUpdate = Pick<
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  MovimientoRecurrente,
  'categoria_id' | 'monto_esperado' | 'frecuencia' | 'descripcion'
>;

<<<<<<< HEAD
export type RecurringMovementAction = 'confirmar' | 'omitir';
=======
export type RecurringAction = 'confirmar' | 'omitir';
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
