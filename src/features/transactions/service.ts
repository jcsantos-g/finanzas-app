import { supabase } from '@/lib/supabase';
import type { Movimiento, TipoMovimiento } from '@/types/database';

/**
 * Ejemplo del patrón de servicios: todo acceso a datos vive en service.ts,
 * las pantallas nunca llaman a Supabase directamente.
 * Integrante 2: amplía este archivo (crear, editar, eliminar).
 */

export async function listTransactions(params: {
  tipo?: TipoMovimiento;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}): Promise<Movimiento[]> {
  let query = supabase.from('movimientos').select('*').order('fecha', { ascending: false });
  if (params.tipo) query = query.eq('tipo', params.tipo);
  if (params.desde) query = query.gte('fecha', params.desde);
  if (params.hasta) query = query.lte('fecha', params.hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
