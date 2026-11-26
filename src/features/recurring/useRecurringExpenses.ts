import { useCallback, useEffect, useState } from 'react';

import type { MovimientoRecurrente } from '@/types/database';

import { listRecurringExpenses } from './service';

type State = {
  expenses: MovimientoRecurrente[];
  loading: boolean;
  error: string | null;
};

export function useRecurringExpenses() {
  const [state, setState] = useState<State>({ expenses: [], loading: true, error: null });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const expenses = await listRecurringExpenses();
      setState({ expenses, loading: false, error: null });
    } catch (error) {
      setState({
        expenses: [],
        loading: false,
        error: error instanceof Error ? error.message : 'No se pudieron cargar los gastos recurrentes.',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    void reload();
  }, [reload]);

  return { ...state, reload };
}
