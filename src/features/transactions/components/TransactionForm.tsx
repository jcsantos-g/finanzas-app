import { ThemedText } from '@/components/themed-text';
import {
  Button,
  Card,
  CategoryPicker,
  DatePickerField,
  EmptyState,
  ErrorState,
  LoadingState,
  MoneyInput,
  TextField,
} from '@/components/ui';
import { useCategories } from '@/features/categories/useCategories';
import { isPositiveAmount } from '@/lib/validators';
import type { Movimiento, TipoMovimiento } from '@/types/database';

export type TransactionFormState = {
  transaction: Movimiento | null;
  type: TipoMovimiento;
  amount: number | null;
  categoryId: string | null;
  date: string;
  description: string;
};

type Props = {
  form: TransactionFormState;
  onChange: (form: TransactionFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  saving: boolean;
  error: string | null;
};

export function TransactionForm({
  form,
  onChange,
  onSave,
  onCancel,
  onDelete,
  saving,
  error,
}: Props) {
  const { categories, loading, error: categoriesError, reload } =
    useCategories(form.type);

  const options = categories.filter(
    (category) => category.tipo === form.type,
  );

  const categoriesReady = !loading && !categoriesError;
  const isNew = form.transaction === null;

  return (
    <Card>
      <ThemedText type="subtitle">
        {isNew
          ? form.type === 'ingreso'
            ? 'Registrar ingreso'
            : 'Registrar gasto'
          : 'Editar movimiento'}
      </ThemedText>

      <MoneyInput
        label="Monto"
        value={form.amount}
        onChange={(amount) => onChange({ ...form, amount })}
        error={
          form.amount !== null && !isPositiveAmount(form.amount)
            ? 'El monto debe ser mayor que cero.'
            : undefined
        }
      />

      {categoriesError ? (
        <ErrorState
          message={categoriesError}
          onRetry={() => void reload()}
        />
      ) : null}

      {loading ? (
        <LoadingState message="Cargando categorías" />
      ) : null}

      {categoriesReady && options.length === 0 ? (
        <EmptyState message="No hay categorías disponibles para este tipo de movimiento." />
      ) : null}

      {categoriesReady && options.length > 0 ? (
        <CategoryPicker
          label="Categoría"
          categories={options}
          value={form.categoryId}
          onChange={(categoryId) =>
            onChange({ ...form, categoryId })
          }
        />
      ) : null}

      <DatePickerField
        label="Fecha"
        value={form.date}
        onChange={(date) => onChange({ ...form, date })}
      />

      <TextField
        label="Descripción (opcional)"
        value={form.description}
        onChangeText={(description) =>
          onChange({ ...form, description })
        }
        placeholder={
          form.type === 'ingreso'
            ? 'Ej. Sueldo'
            : 'Ej. Compra de alimentos'
        }
        maxLength={200}
      />

      {error ? <ErrorState message={error} /> : null}

      <Button
        label={isNew ? 'Guardar movimiento' : 'Guardar cambios'}
        onPress={onSave}
        loading={saving}
        disabled={
          saving ||
          loading ||
          !form.categoryId ||
          !isPositiveAmount(form.amount)
        }
      />

      {!isNew && onDelete ? (
        <Button
          label="Eliminar movimiento"
          variant="secondary"
          onPress={onDelete}
          disabled={saving}
        />
      ) : null}

      <Button
        label="Cancelar"
        variant="secondary"
        onPress={onCancel}
        disabled={saving}
      />
    </Card>
  );
}
