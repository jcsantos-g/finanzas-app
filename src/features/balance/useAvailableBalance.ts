import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getAvailableBalance } from './service';

type State = { balance: number | null; loading: boolean; failed: boolean };

/** Carga el saldo y lo actualiza cada vez que la pantalla vuelve a estar visible. */
export function useAvailableBalance() {
  const [state, setState] = useState<State>({ balance: null, loading: true, failed: false });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, failed: false }));
    try {
      const balance = await getAvailableBalance();
      setState({ balance, loading: false, failed: false });
    } catch {
      setState({ balance: null, loading: false, failed: true });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { ...state, reload };
}
