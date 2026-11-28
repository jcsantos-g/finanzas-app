import { useCallback, useEffect, useRef, useState } from 'react';

import { getMonthlyReport, type MonthlyReport } from './service';

type State = {
  report: MonthlyReport | null;
  loading: boolean;
  error: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'No se pudo cargar el reporte.';
}

export function useReports(year: number, month: number) {
  const [state, setState] = useState<State>({
    report: null,
    loading: true,
    error: null,
  });
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState({ report: null, loading: true, error: null });

    try {
      const report = await getMonthlyReport(year, month);
      if (requestId === requestIdRef.current) {
        setState({ report, loading: false, error: null });
      }
    } catch (error: unknown) {
      if (requestId === requestIdRef.current) {
        setState({ report: null, loading: false, error: getErrorMessage(error) });
      }
    }
  }, [year, month]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y al cambiar el período
    void reload();
    return () => {
      requestIdRef.current += 1;
    };
  }, [reload]);

  return { ...state, reload };
}
