import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import {
  Button,
  ConfirmModal,
  ErrorState,
  LoadingState,
  ScreenContainer,
} from '@/components/ui';
import { todayIso } from '@/lib/dates';
import { isPositiveAmount } from '@/lib/validators';

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from '@/features/transactions/service';
import {
  TransactionForm,
  type TransactionFormState,
} from '@/features/transactions/components/TransactionForm';

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}

export default function TransactionFormRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
  }>();

  const transactionId = params.id;
  const typeParam = params.type;

  const [form, setForm] = useState<TransactionFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadForm() {
      setLoading(true);
      setError(null);
      setForm(null);

      if (typeParam !== 'ingreso' && typeParam !== 'gasto') {
        if (active) {
          setError('El tipo de movimiento no es válido.');
          setLoading(false);
        }
        return;
      }

      try {
        if (transactionId) {
          const transaction = await getTransaction(transactionId);

          if (transaction.tipo !== typeParam) {
            throw new Error('El movimiento no corresponde a esta sección.');
          }

          if (transaction.origen !== 'manual') {
            throw new Error('Este movimiento automático no se puede editar.');
          }

          if (active) {
            setForm({
              transaction,
              type: transaction.tipo,
              amount: transaction.monto,
              categoryId: transaction.categoria_id,
              date: transaction.fecha,
              description: transaction.descripcion ?? '',
            });
          }
        } else if (active) {
          setForm({
            transaction: null,
            type: typeParam,
            amount: null,
            categoryId: null,
            date: todayIso(),
            description: '',
          });
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadForm();

    return () => {
      active = false;
    };
  }, [transactionId, typeParam]);

  async function saveForm() {
    if (!form || !form.categoryId || !isPositiveAmount(form.amount)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const input = {
        tipo: form.type,
        categoria_id: form.categoryId,
        monto: form.amount,
        fecha: form.date,
        descripcion: form.description.trim() || null,
      };

      if (form.transaction) {
        await updateTransaction(form.transaction.id, input);
      } else {
        await createTransaction(input);
      }

      router.back();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeletion() {
    if (!form?.transaction) return;

    setSaving(true);
    setError(null);

    try {
      await deleteTransaction(form.transaction.id);
      setConfirmDelete(false);
      router.back();
    } catch (deleteError) {
      setConfirmDelete(false);
      setError(getErrorMessage(deleteError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Cargando movimiento..." />
      </ScreenContainer>
    );
  }

  if (error && !form) {
    return (
      <ScreenContainer>
        <ErrorState message={error} />
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  if (!form) return null;

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">
        {form.type === 'ingreso' ? 'Ingresos' : 'Gastos'}
      </ThemedText>

      <TransactionForm
        form={form}
        onChange={setForm}
        onSave={() => void saveForm()}
        onCancel={() => router.back()}
        onDelete={
          form.transaction
            ? () => setConfirmDelete(true)
            : undefined
        }
        saving={saving}
        error={error}
      />

      <ConfirmModal
        visible={confirmDelete}
        title="¿Eliminar este movimiento?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        loading={saving}
        onConfirm={() => void confirmDeletion()}
        onCancel={() => setConfirmDelete(false)}
      />
    </ScreenContainer>
  );
}
