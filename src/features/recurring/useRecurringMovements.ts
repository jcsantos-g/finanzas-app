import { useCallback, useEffect, useState } from 'react';

import type { MovimientoRecurrente } from '@/types/database';

import { listRecurringMovements } from './service';

type State = {
  movements: MovimientoRecurrente[];
  loading: boolean;
  error: string | null;
};

export function useRecurringMovements() {
  const [state, setState] = useState<State>({ movements: [], loading: true, error: null });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const movements = await listRecurringMovements();
      setState({ movements, loading: false, error: null });
    } catch (error) {
      setState({
        movements: [],
        loading: false,
        error: error instanceof Error ? error.message : 'No se pudieron cargar los movimientos recurrentes.',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    void reload();
  }, [reload]);

  return { ...state, reload };
}
