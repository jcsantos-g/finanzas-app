import { supabase } from '@/lib/supabase';
import type { Category, MovementType } from '@/types/database';

/** Lista las categorías del usuario de un tipo (ingreso o gasto), ordenadas por nombre. */
export async function listCategories(type: MovementType): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}
