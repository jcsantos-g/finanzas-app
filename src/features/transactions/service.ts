
import { supabase } from '@/lib/supabase';
import type { Movimiento, TipoMovimiento } from '@/types/database';

export type TransactionInput = {
  tipo: TipoMovimiento;
  categoria_id: string;
  monto: number;
  /** Fecha del movimiento en formato YYYY-MM-DD. */
  fecha: string;
  descripcion?: string | null;
};

/** Obtiene los movimientos del usuario, ordenados por fecha. */
export async function listTransactions(params: {
  tipo?: TipoMovimiento;
  /** Fecha inicial en formato YYYY-MM-DD. */
  desde?: string;
  /** Fecha final en formato YYYY-MM-DD. */
  hasta?: string;
} = {}): Promise<Movimiento[]> {
  let query = supabase
    .from('movimientos')
    .select('*')
    .order('fecha', { ascending: false });

  if (params.tipo) query = query.eq('tipo', params.tipo);
  if (params.desde) query = query.gte('fecha', params.desde);
  if (params.hasta) query = query.lte('fecha', params.hasta);

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

/** Obtiene un movimiento específico. */
export async function getTransaction(id: string): Promise<Movimiento> {
  const { data, error } = await supabase
    .from('movimientos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

/** Registra un nuevo ingreso o gasto manual. */
export async function createTransaction(
  input: TransactionInput,
): Promise<Movimiento> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!authData.user) throw new Error('Debes iniciar sesión para registrar movimientos.');

  const { data, error } = await supabase
    .from('movimientos')
    .insert({
      usuario_id: authData.user.id,
      tipo: input.tipo,
      categoria_id: input.categoria_id,
      monto: input.monto,
      fecha: input.fecha,
      descripcion: input.descripcion?.trim() || null,
      origen: 'manual',
    })
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

/** Verifica que el movimiento pueda modificarse desde el módulo manual. */
async function ensureManualTransaction(id: string): Promise<void> {
  const transaction = await getTransaction(id);

  if (transaction.origen !== 'manual') {
    throw new Error(
      'Este movimiento no puede modificarse porque no fue registrado manualmente.',
    );
  }
}

/** Actualiza un movimiento existente. */
export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<Movimiento> {
  await ensureManualTransaction(id);
  const { data, error } = await supabase
    .from('movimientos')
    .update({
      tipo: input.tipo,
      categoria_id: input.categoria_id,
      monto: input.monto,
      fecha: input.fecha,
      ...(input.descripcion !== undefined
        ? { descripcion: input.descripcion?.trim() || null }
        : {}),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

/** Elimina un movimiento y comprueba que realmente existía. */
export async function deleteTransaction(id: string): Promise<void> {
  await ensureManualTransaction(id);

  const { data, error } = await supabase
    .from('movimientos')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No se encontró el movimiento o no tienes permiso para eliminarlo.');
  }
}
