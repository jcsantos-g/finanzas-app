import { supabase } from '@/lib/supabase';
import type { Categoria, TipoMovimiento } from '@/types/database';

/** Lista las categorías del usuario de un tipo (ingreso o gasto), ordenadas por nombre. */
export async function listCategories(tipo: TipoMovimiento): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tipo', tipo)
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}
