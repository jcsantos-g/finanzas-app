import { supabase } from '@/lib/supabase';

/** Dinero disponible (RF-06): ingresos menos gastos reales. Lo calcula la base de datos. */
export async function getAvailableBalance(): Promise<number> {
  const { data, error } = await supabase.rpc('dinero_disponible');
  if (error) throw error;
  return Number(data ?? 0);
}
