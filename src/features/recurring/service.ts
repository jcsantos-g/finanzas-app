import { supabase } from '@/lib/supabase';
import { addInterval, todayIso } from '@/lib/dates';
import { isPositiveAmount } from '@/lib/validators';
import type { MovimientoRecurrente } from '@/types/database';

import type {
  RecurringExpenseAction,
  RecurringExpenseInput,
  RecurringExpenseUpdate,
} from './types';

export async function listRecurringExpenses(): Promise<MovimientoRecurrente[]> {
  const { data, error } = await supabase
    .from('movimientos_recurrentes')
    .select('*')
    .eq('tipo', 'gasto')
    .order('proxima_fecha', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createRecurringExpense(input: RecurringExpenseInput): Promise<MovimientoRecurrente> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error('Inicia sesión para programar un gasto recurrente.');

  const { data, error } = await supabase
    .from('movimientos_recurrentes')
    .insert({
      ...input,
      usuario_id: sessionData.session.user.id,
      tipo: 'gasto',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecurringExpense(
  id: string,
  input: RecurringExpenseUpdate,
): Promise<MovimientoRecurrente> {
  const { data, error } = await supabase
    .from('movimientos_recurrentes')
    .update(input)
    .eq('id', id)
    .eq('tipo', 'gasto')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function setRecurringExpenseActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('movimientos_recurrentes')
    .update({ activo: active })
    .eq('id', id)
    .eq('tipo', 'gasto')
    .select('id')
    .single();

  if (error) throw error;
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const { data: linkedMovements, error: movementsError } = await supabase
    .from('movimientos')
    .select('id')
    .eq('movimiento_recurrente_id', id)
    .limit(1);

  if (movementsError) throw movementsError;
  if (linkedMovements.length > 0) {
    throw new Error('No se puede eliminar porque ya tiene gastos confirmados. Pausa la programación para conservar el historial.');
  }

  const { error } = await supabase
    .from('movimientos_recurrentes')
    .delete()
    .eq('id', id)
    .eq('tipo', 'gasto')
    .select('id')
    .single();

  if (error) throw error;
}

export async function resolveRecurringExpenseOccurrence(
  schedule: MovimientoRecurrente,
  action: RecurringExpenseAction,
  amount: number | null,
): Promise<string> {
  if (action === 'confirmar' && !isPositiveAmount(amount)) {
    throw new Error('El monto real debe ser mayor que cero.');
  }

  const anchorDay = Number(schedule.fecha_inicio.slice(-2));
  const nextDate = addInterval(schedule.proxima_fecha, schedule.frecuencia, anchorDay);

  const { data, error } = await supabase.rpc('resolver_gasto_recurrente', {
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
