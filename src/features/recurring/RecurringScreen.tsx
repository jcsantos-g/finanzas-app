import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  Button,
  Card,
  CategoryPicker,
  ConfirmModal,
  DatePickerField,
  EmptyState,
  ErrorState,
  ListItem,
  LoadingState,
  MoneyInput,
  ScreenContainer,
  TextField,
} from '@/components/ui';
import { useCategories } from '@/features/categories/useCategories';
import {
  createRecurringExpense,
  deleteRecurringExpense,
  resolveRecurringExpenseOccurrence,
  setRecurringExpenseActive,
  updateRecurringExpense,
} from '@/features/recurring/service';
import type { RecurringExpenseAction, RecurringExpenseInput, RecurringExpenseUpdate } from '@/features/recurring/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { todayIso } from '@/lib/dates';
import { isPositiveAmount } from '@/lib/validators';
import type { Frecuencia, MovimientoRecurrente } from '@/types/database';

import { useRecurringExpenses } from './useRecurringExpenses';

type FormState = {
  mode: 'create' | 'edit';
  schedule: MovimientoRecurrente | null;
  amount: number | null;
  categoryId: string | null;
  frequency: Frecuencia;
  startDate: string;
  description: string;
};

type PendingAction = { type: 'skip' | 'delete'; schedule: MovimientoRecurrente } | null;

const FREQUENCIES: { value: Frecuencia; label: string }[] = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

const FREQUENCY_LABELS: Record<Frecuencia, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export function RecurringScreen() {
  const { expenses, loading, error, reload } = useRecurringExpenses();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories('gasto');
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [confirming, setConfirming] = useState<{ schedule: MovimientoRecurrente; amount: number | null } | null>(
    null,
  );
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.nombre])), [categories]);
  const currentDate = todayIso();
  const activeExpenses = expenses.filter((expense) => expense.activo);
  const pausedExpenses = expenses.filter((expense) => !expense.activo);

  function openCreateForm() {
    setActionError(null);
    setFormError(null);
    setForm({
      mode: 'create',
      schedule: null,
      amount: null,
      categoryId: null,
      frequency: 'mensual',
      startDate: currentDate,
      description: '',
    });
  }

  function openEditForm(schedule: MovimientoRecurrente) {
    setActionError(null);
    setFormError(null);
    setForm({
      mode: 'edit',
      schedule,
      amount: schedule.monto_esperado,
      categoryId: schedule.categoria_id,
      frequency: schedule.frecuencia,
      startDate: schedule.fecha_inicio,
      description: schedule.descripcion ?? '',
    });
  }

  async function performAction(operation: () => Promise<unknown>, onSuccess?: () => void) {
    setSaving(true);
    setActionError(null);
    try {
      await operation();
      onSuccess?.();
      await reload();
    } catch (operationError) {
      setActionError(errorMessage(operationError));
    } finally {
      setSaving(false);
    }
  }

  async function saveForm() {
    if (!form) return;
    if (!isPositiveAmount(form.amount)) {
      setFormError('Ingresa un monto mayor que cero.');
      return;
    }
    if (!form.categoryId) {
      setFormError('Selecciona una categoría.');
      return;
    }

    setFormError(null);
    const description = form.description.trim() || null;
    const commonFields = {
      categoria_id: form.categoryId,
      monto_esperado: form.amount,
      frecuencia: form.frequency,
      descripcion: description,
    };

    if (form.mode === 'create') {
      const input: RecurringExpenseInput = {
        ...commonFields,
        fecha_inicio: form.startDate,
        proxima_fecha: form.startDate,
      };
      await performAction(() => createRecurringExpense(input), () => setForm(null));
      return;
    }

    if (!form.schedule) return;
    const schedule = form.schedule;
    const input: RecurringExpenseUpdate = commonFields;
    await performAction(() => updateRecurringExpense(schedule.id, input), () => setForm(null));
  }

  async function resolveOccurrence(schedule: MovimientoRecurrente, action: RecurringExpenseAction, amount: number | null) {
    await performAction(
      () => resolveRecurringExpenseOccurrence(schedule, action, amount),
      () => {
        setConfirming(null);
        setPendingAction(null);
      },
    );
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;

    if (pendingAction.type === 'skip') {
      await resolveOccurrence(pendingAction.schedule, 'omitir', null);
      return;
    }

    await performAction(() => deleteRecurringExpense(pendingAction.schedule.id), () => setPendingAction(null));
  }

  function renderExpense(schedule: MovimientoRecurrente) {
    const isDue = schedule.proxima_fecha <= currentDate;
    const showConfirmation = confirming?.schedule.id === schedule.id;
    const status = !schedule.activo
      ? 'Pausado'
      : schedule.proxima_fecha < currentDate
        ? 'Vencido'
        : schedule.proxima_fecha === currentDate
          ? 'Pendiente hoy'
          : 'Próximo';
    const actionsDisabled = saving || form !== null || pendingAction !== null || confirming !== null;
    return (
      <Card key={schedule.id}>
        <ListItem
          title={categoryNames.get(schedule.categoria_id) ?? 'Gasto recurrente'}
          subtitle={`${status} · ${formatDate(schedule.proxima_fecha)} · ${FREQUENCY_LABELS[schedule.frecuencia]}`}
          rightText={formatCurrency(schedule.monto_esperado)}
        />
        {schedule.descripcion ? (
          <ThemedText themeColor="textSecondary">{schedule.descripcion}</ThemedText>
        ) : null}
        <View style={styles.actions}>
          <Button
            label="Editar"
            variant="secondary"
            onPress={() => openEditForm(schedule)}
            disabled={actionsDisabled}
          />
          <Button
            label={schedule.activo ? 'Pausar' : 'Reanudar'}
            variant="secondary"
            onPress={() => void performAction(() => setRecurringExpenseActive(schedule.id, !schedule.activo))}
            disabled={actionsDisabled}
          />
          <Button
            label="Eliminar"
            variant="danger"
            onPress={() => setPendingAction({ type: 'delete', schedule })}
            disabled={actionsDisabled}
          />
        </View>
        {schedule.activo && isDue ? (
          <View style={styles.actions}>
            <Button
              label="Confirmar ocurrencia"
              onPress={() => {
                setActionError(null);
                setConfirming({ schedule, amount: schedule.monto_esperado });
              }}
              disabled={actionsDisabled}
            />
            <Button
              label="Omitir"
              variant="secondary"
              onPress={() => setPendingAction({ type: 'skip', schedule })}
              disabled={actionsDisabled}
            />
          </View>
        ) : null}
        {showConfirmation && confirming ? (
          <View style={styles.confirmForm}>
            <ThemedText type="smallBold">Confirmar gasto del {formatDate(schedule.proxima_fecha)}</ThemedText>
            <ThemedText themeColor="textSecondary">
              Se registrará el monto real como un gasto y se programará la siguiente fecha.
            </ThemedText>
            <MoneyInput
              label="Monto real"
              value={confirming.amount}
              onChange={(amount) => setConfirming({ ...confirming, amount })}
              error={confirming.amount !== null && !isPositiveAmount(confirming.amount) ? 'El monto debe ser mayor que cero.' : undefined}
            />
            {actionError ? <ErrorState message={actionError} /> : null}
            <Button
              label="Guardar gasto"
              onPress={() => void resolveOccurrence(schedule, 'confirmar', confirming.amount)}
              loading={saving}
              disabled={!isPositiveAmount(confirming.amount)}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => {
                setConfirming(null);
                setActionError(null);
              }}
              disabled={saving}
            />
          </View>
        ) : null}
      </Card>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Gastos recurrentes</ThemedText>
      <ThemedText themeColor="textSecondary">
        Programa gastos que se repiten. Solo al confirmar una ocurrencia se registra como movimiento real.
      </ThemedText>
      <Button
        label="Programar gasto"
        onPress={openCreateForm}
        disabled={saving || form !== null || confirming !== null || pendingAction !== null}
      />
      {actionError && !confirming ? <ErrorState message={actionError} /> : null}

      {form ? (
        <Card>
          <ThemedText type="subtitle">{form.mode === 'create' ? 'Nuevo gasto' : 'Editar gasto recurrente'}</ThemedText>
          {categoriesError ? <ErrorState message={categoriesError} onRetry={() => void reloadCategories()} /> : null}
          {categoriesLoading ? <LoadingState message="Cargando categorías" /> : null}
          {!categoriesLoading && !categoriesError && categories.length === 0 ? (
            <EmptyState message="No hay categorías de gastos disponibles." />
          ) : null}
          <MoneyInput
            label="Monto esperado"
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
            error={formError && !isPositiveAmount(form.amount) ? formError : undefined}
          />
          {!categoriesLoading && !categoriesError && categories.length > 0 ? (
            <CategoryPicker
              categories={categories}
              value={form.categoryId}
              onChange={(categoryId) => {
                setForm({ ...form, categoryId });
                setFormError(null);
              }}
              error={formError && !form.categoryId ? formError : undefined}
            />
          ) : null}
          <FrequencySelector
            value={form.frequency}
            onChange={(frequency) => setForm({ ...form, frequency })}
          />
          {form.mode === 'create' ? (
            <DatePickerField
              label="Primera fecha programada"
              value={form.startDate}
              onChange={(startDate) => setForm({ ...form, startDate })}
            />
          ) : (
            <ThemedText themeColor="textSecondary">
              Primera fecha: {formatDate(form.startDate)}. La fecha de inicio no cambia al editar.
            </ThemedText>
          )}
          <TextField
            label="Descripción (opcional)"
            value={form.description}
            onChangeText={(description) => setForm({ ...form, description })}
            placeholder="Ej. Renta"
            maxLength={200}
          />
          {formError && form.categoryId && isPositiveAmount(form.amount) ? (
            <ThemedText style={styles.errorText}>{formError}</ThemedText>
          ) : null}
          {actionError ? <ErrorState message={actionError} /> : null}
          <Button
            label={form.mode === 'create' ? 'Guardar programación' : 'Guardar cambios'}
            onPress={() => void saveForm()}
            loading={saving}
            disabled={
              saving ||
              categoriesLoading ||
              categories.length === 0 ||
              !form.categoryId ||
              !isPositiveAmount(form.amount)
            }
          />
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={() => {
              setForm(null);
              setFormError(null);
              setActionError(null);
            }}
            disabled={saving}
          />
        </Card>
      ) : null}

      {loading && expenses.length === 0 ? <LoadingState message="Cargando gastos recurrentes" /> : null}
      {error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}
      {!loading && !error && expenses.length === 0 ? (
        <EmptyState message="Todavía no tienes gastos recurrentes programados." />
      ) : null}
      {activeExpenses.length > 0 ? (
        <>
          <ThemedText type="subtitle">Activos</ThemedText>
          {activeExpenses.map(renderExpense)}
        </>
      ) : null}
      {pausedExpenses.length > 0 ? (
        <>
          <ThemedText type="subtitle">Pausados</ThemedText>
          {pausedExpenses.map(renderExpense)}
        </>
      ) : null}

      <ConfirmModal
        visible={pendingAction !== null}
        title={pendingAction?.type === 'skip' ? '¿Omitir esta ocurrencia?' : '¿Eliminar esta programación?'}
        message={
          pendingAction?.type === 'skip'
            ? `No se creará un gasto y la siguiente fecha será calculada desde ${formatDate(pendingAction.schedule.proxima_fecha)}.${actionError ? `\n${actionError}` : ''}`
            : `Los gastos confirmados se conservarán.${actionError ? `\n${actionError}` : ''}`
        }
        confirmLabel={pendingAction?.type === 'skip' ? 'Omitir' : 'Eliminar'}
        destructive={pendingAction?.type === 'delete'}
        loading={saving}
        onConfirm={() => void confirmPendingAction()}
        onCancel={() => {
          setPendingAction(null);
          setActionError(null);
        }}
      />
    </ScreenContainer>
  );
}

function FrequencySelector({ value, onChange }: { value: Frecuencia; onChange: (value: Frecuencia) => void }) {
  return (
    <View style={styles.frequencySelector}>
      <ThemedText type="smallBold">Frecuencia</ThemedText>
      <View style={styles.actions}>
        {FREQUENCIES.map((frequency) => (
          <Button
            key={frequency.value}
            label={frequency.label}
            variant={value === frequency.value ? 'primary' : 'secondary'}
            onPress={() => onChange(frequency.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  confirmForm: { gap: 10, marginTop: 8 },
  frequencySelector: { gap: 6 },
  errorText: { color: '#DC2626' },
});
