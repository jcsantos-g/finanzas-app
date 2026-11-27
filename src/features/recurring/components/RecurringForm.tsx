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
import { formatDate } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';
import type { Frecuencia, MovimientoRecurrente, TipoMovimiento } from '@/types/database';

import { FREQUENCY_OPTIONS, TYPE_LABELS, TYPE_OPTIONS } from '../labels';
import { OptionSelector } from './OptionSelector';

export type FormState = {
  /** null al programar uno nuevo. */
  schedule: MovimientoRecurrente | null;
  type: TipoMovimiento;
  amount: number | null;
  categoryId: string | null;
  frequency: Frecuencia;
  startDate: string;
  description: string;
};

type Props = {
  form: FormState;
  onChange: (form: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
};

export function RecurringForm({ form, onChange, onSave, onCancel, saving, error }: Props) {
  const { categories, loading, error: categoriesError, reload } = useCategories(form.type);
  // Mientras cambia el tipo, el hook puede conservar un momento las categorías del tipo anterior.
  const options = categories.filter((category) => category.tipo === form.type);
  const categoriesReady = !loading && !categoriesError;
  const isNew = form.schedule === null;

  return (
    <Card>
      <ThemedText type="subtitle">{isNew ? 'Nuevo recurrente' : 'Editar recurrente'}</ThemedText>
      {isNew ? (
        <OptionSelector
          label="Tipo"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(type) => {
            if (type !== form.type) onChange({ ...form, type, categoryId: null });
          }}
        />
      ) : (
        <ThemedText themeColor="textSecondary">
          Tipo: {TYPE_LABELS[form.type]}. El tipo no cambia al editar.
        </ThemedText>
      )}
      <MoneyInput
        label="Monto esperado"
        value={form.amount}
        onChange={(amount) => onChange({ ...form, amount })}
        error={form.amount !== null && !isPositiveAmount(form.amount) ? 'El monto debe ser mayor que cero.' : undefined}
      />
      {categoriesError ? <ErrorState message={categoriesError} onRetry={() => void reload()} /> : null}
      {loading ? <LoadingState message="Cargando categorías" /> : null}
      {categoriesReady && options.length === 0 ? <EmptyState message="No hay categorías de este tipo." /> : null}
      {categoriesReady && options.length > 0 ? (
        <CategoryPicker
          categories={options}
          value={form.categoryId}
          onChange={(categoryId) => onChange({ ...form, categoryId })}
        />
      ) : null}
      <OptionSelector
        label="Frecuencia"
        options={FREQUENCY_OPTIONS}
        value={form.frequency}
        onChange={(frequency) => onChange({ ...form, frequency })}
      />
      {isNew ? (
        <DatePickerField
          label="Primera fecha programada"
          value={form.startDate}
          onChange={(startDate) => onChange({ ...form, startDate })}
        />
      ) : (
        <ThemedText themeColor="textSecondary">
          Primera fecha: {formatDate(form.startDate)}. La fecha de inicio no cambia al editar.
        </ThemedText>
      )}
      <TextField
        label="Descripción (opcional)"
        value={form.description}
        onChangeText={(description) => onChange({ ...form, description })}
        placeholder={form.type === 'ingreso' ? 'Ej. Sueldo' : 'Ej. Renta'}
        maxLength={200}
      />
      {error ? <ErrorState message={error} /> : null}
      <Button
        label={isNew ? 'Guardar programación' : 'Guardar cambios'}
        onPress={onSave}
        loading={saving}
        disabled={!form.categoryId || !isPositiveAmount(form.amount)}
      />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={saving} />
    </Card>
  );
}
