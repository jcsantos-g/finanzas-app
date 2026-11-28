import { useRouter } from 'expo-router';

import {
  Button,
  EmptyState,
  ErrorState,
  ListItem,
  LoadingState,
  ScreenContainer,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { TipoMovimiento } from '@/types/database';

import { useCategories } from '../categories/useCategories';
import { useTransactions } from './hooks/useTransactions';

type Props = {
  tipo: TipoMovimiento;
};

export function TransactionsScreen({ tipo }: Props) {
  const router = useRouter();
  const { transactions, loading, error, reload } = useTransactions(tipo);
  const { categories } = useCategories(tipo);

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.nombre]),
  );

  function openForm(id?: string) {
    router.push({
      pathname: '/(app)/transaction-form',
      params: {
        type: tipo,
        ...(id ? { id } : {}),
      },
    });
  }

  const title = tipo === 'ingreso' ? 'Ingresos' : 'Gastos';

  return (
    <ScreenContainer scroll>
      <Button
        label={`Registrar ${tipo}`}
        onPress={() => openForm()}
      />

      {loading ? (
        <LoadingState message={`Cargando ${title.toLowerCase()}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : transactions.length === 0 ? (
        <EmptyState
          message={`Todavía no hay ${title.toLowerCase()}. Cuando registres un ${tipo}, aparecerá aquí.`}
        />
      ) : (
        transactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            title={categoryNames.get(transaction.categoria_id) ?? 'Sin categoría'}
            subtitle={[
              formatDate(transaction.fecha),
              transaction.descripcion,
              transaction.origen !== 'manual'
                ? 'Movimiento automático'
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            rightText={formatCurrency(transaction.monto)}
            onPress={
              transaction.origen === 'manual'
                ? () => openForm(transaction.id)
                : undefined
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}
