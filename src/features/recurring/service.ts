import { addInterval, todayIso } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { isPositiveAmount } from '@/lib/validators';
import type { MovimientoRecurrente } from '@/types/database';

<<<<<<< HEAD
import type {
  RecurringMovementAction,
  RecurringMovementInput,
  RecurringMovementUpdate,
} from './types';

export async function listRecurringMovements(): Promise<MovimientoRecurrente[]> {
=======
import type { RecurringAction, RecurringInput, RecurringUpdate } from './types';

export async function listRecurring(): Promise<MovimientoRecurrente[]> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const { data, error } = await supabase
    .from('movimientos_recurrentes')
    .select('*')
    .order('proxima_fecha', { ascending: true });

  if (error) throw error;
  return data;
}

<<<<<<< HEAD
export async function createRecurringMovement(input: RecurringMovementInput): Promise<MovimientoRecurrente> {
=======
export async function createRecurring(input: RecurringInput): Promise<MovimientoRecurrente> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error('Inicia sesión para programar un movimiento recurrente.');

  const { data, error } = await supabase
    .from('movimientos_recurrentes')
<<<<<<< HEAD
    .insert({
      ...input,
      usuario_id: sessionData.session.user.id,
    })
=======
    .insert({ ...input, usuario_id: sessionData.session.user.id })
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

<<<<<<< HEAD
export async function updateRecurringMovement(
  id: string,
  tipo: MovimientoRecurrente['tipo'],
  input: RecurringMovementUpdate,
): Promise<MovimientoRecurrente> {
=======
export async function updateRecurring(id: string, input: RecurringUpdate): Promise<MovimientoRecurrente> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const { data, error } = await supabase
    .from('movimientos_recurrentes')
    .update(input)
    .eq('id', id)
<<<<<<< HEAD
    .eq('tipo', tipo)
=======
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

<<<<<<< HEAD
export async function setRecurringMovementActive(
  id: string,
  tipo: MovimientoRecurrente['tipo'],
  active: boolean,
): Promise<void> {
=======
export async function setRecurringActive(id: string, active: boolean): Promise<void> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const { error } = await supabase
    .from('movimientos_recurrentes')
    .update({ activo: active })
    .eq('id', id)
<<<<<<< HEAD
    .eq('tipo', tipo)
=======
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    .select('id')
    .single();

  if (error) throw error;
}

<<<<<<< HEAD
export async function deleteRecurringMovement(id: string, tipo: MovimientoRecurrente['tipo']): Promise<void> {
=======
export async function deleteRecurring(id: string): Promise<void> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const { data: linkedMovements, error: movementsError } = await supabase
    .from('movimientos')
    .select('id')
    .eq('movimiento_recurrente_id', id)
    .limit(1);

  if (movementsError) throw movementsError;
  if (linkedMovements.length > 0) {
<<<<<<< HEAD
    throw new Error('No se puede eliminar porque ya tiene movimientos confirmados. Pausa la programación para conservar el historial.');
  }

  const { error } = await supabase
    .from('movimientos_recurrentes')
    .delete()
    .eq('id', id)
    .eq('tipo', tipo)
    .select('id')
    .single();
=======
    throw new Error(
      'No se puede eliminar porque ya tiene movimientos confirmados. Pausa la programación para conservar el historial.',
    );
  }

  const { error } = await supabase.from('movimientos_recurrentes').delete().eq('id', id).select('id').single();
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77

  if (error) throw error;
}

<<<<<<< HEAD
export async function resolveRecurringMovementOccurrence(
  schedule: MovimientoRecurrente,
  action: RecurringMovementAction,
=======
/** Confirma (RN-06) u omite (RN-07) la ocurrencia pendiente y avanza la fecha en una sola transacción. */
export async function resolveRecurringOccurrence(
  schedule: MovimientoRecurrente,
  action: RecurringAction,
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  amount: number | null,
): Promise<string> {
  if (action === 'confirmar' && !isPositiveAmount(amount)) {
    throw new Error('El monto real debe ser mayor que cero.');
  }

  const anchorDay = Number(schedule.fecha_inicio.slice(-2));
  const nextDate = addInterval(schedule.proxima_fecha, schedule.frecuencia, anchorDay);

  const { data, error } = await supabase.rpc('resolver_movimiento_recurrente', {
    p_movimiento_recurrente_id: schedule.id,
    p_fecha_programada: schedule.proxima_fecha,
    p_proxima_fecha: nextDate,
    p_accion: action,
    p_monto: action === 'confirmar' ? amount : null,
    p_fecha_real: action === 'confirmar' ? todayIso() : null,
  });

  if (error) throw error;
  return data;
}
