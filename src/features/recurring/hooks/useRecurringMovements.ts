import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { MovimientoRecurrente } from '@/types/database';

import { getErrorMessage } from '../errors';
import { listRecurring } from '../service';

type State = {
  schedules: MovimientoRecurrente[];
  loading: boolean;
  error: string | null;
};

/** Carga las programaciones y las actualiza cada vez que la pantalla vuelve a estar visible. */
export function useRecurringMovements() {
  const [state, setState] = useState<State>({ schedules: [], loading: true, error: null });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const schedules = await listRecurring();
      setState({ schedules, loading: false, error: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, 'No se pudieron cargar los movimientos recurrentes.'),
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { ...state, reload };
}
