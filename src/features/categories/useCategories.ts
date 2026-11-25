import { useCallback, useEffect, useState } from 'react';

import type { Categoria, TipoMovimiento } from '@/types/database';

import { listCategories } from './service';

type State = { categories: Categoria[]; loading: boolean; error: string | null };

/**
 * Carga las categorías de un tipo. Uso típico:
 *   const { categories, loading, error, reload } = useCategories('gasto');
 *   <CategoryPicker categories={categories} value={id} onChange={setId} />
 */
export function useCategories(tipo: TipoMovimiento) {
  const [state, setState] = useState<State>({ categories: [], loading: true, error: null });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const categories = await listCategories(tipo);
      setState({ categories, loading: false, error: null });
    } catch (e) {
      setState({
        categories: [],
        loading: false,
        error: e instanceof Error ? e.message : 'No se pudieron cargar las categorías',
      });
    }
  }, [tipo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    void reload();
  }, [reload]);

  return { ...state, reload };
}
