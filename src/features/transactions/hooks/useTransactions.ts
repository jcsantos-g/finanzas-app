import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { Movimiento, TipoMovimiento } from '@/types/database';

import { listTransactions } from '../service';

type State = {
  transactions: Movimiento[];
  loading: boolean;
  error: string | null;
};

export function useTransactions(tipo: TipoMovimiento) {
  const [state, setState] = useState<State>({
    transactions: [],
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const transactions = await listTransactions({ tipo });

      setState({
        transactions,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los movimientos.',
      }));
    }
  }, [tipo]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return {
    ...state,
    reload,
  };
}
