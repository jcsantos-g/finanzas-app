import { supabase } from '@/lib/supabase';
import type { MovementType, Transaction } from '@/types/database';

/**
 * Ejemplo del patrón de servicios: todo acceso a datos vive en service.ts,
 * las pantallas nunca llaman a Supabase directamente.
 * Integrante 2: amplía este archivo (crear, editar, eliminar, categorías).
 */

export async function listTransactions(params: {
  type?: MovementType;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*').order('occurred_at', { ascending: false });
  if (params.type) query = query.eq('type', params.type);
  if (params.from) query = query.gte('occurred_at', params.from);
  if (params.to) query = query.lte('occurred_at', params.to);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
