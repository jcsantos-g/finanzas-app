<<<<<<< HEAD
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
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
  createRecurringMovement,
  deleteRecurringMovement,
  resolveRecurringMovementOccurrence,
  setRecurringMovementActive,
  updateRecurringMovement,
} from '@/features/recurring/service';
import type {
  RecurringMovementAction,
  RecurringMovementInput,
  RecurringMovementUpdate,
} from '@/features/recurring/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
=======
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, ConfirmModal, EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui';
import { useCategories } from '@/features/categories/useCategories';
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
import { todayIso } from '@/lib/dates';
import { formatDate } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';
<<<<<<< HEAD
import type { Frecuencia, MovimientoRecurrente, TipoMovimiento } from '@/types/database';

import { useRecurringMovements } from './useRecurringMovements';

type FormState = {
  mode: 'create' | 'edit';
  schedule: MovimientoRecurrente | null;
  type: TipoMovimiento;
  amount: number | null;
  categoryId: string | null;
  frequency: Frecuencia;
  startDate: string;
  description: string;
};
=======
import type { MovimientoRecurrente } from '@/types/database';

import { RecurringCard } from './components/RecurringCard';
import { RecurringForm, type FormState } from './components/RecurringForm';
import { getErrorMessage } from './errors';
import { useRecurringMovements } from './hooks/useRecurringMovements';
import {
  createRecurring,
  deleteRecurring,
  resolveRecurringOccurrence,
  setRecurringActive,
  updateRecurring,
} from './service';
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77

type PendingAction = { type: 'skip' | 'delete'; schedule: MovimientoRecurrente } | null;
type Confirmation = { schedule: MovimientoRecurrente; amount: number | null } | null;
/** `scheduleId` es null cuando el error viene del formulario. */
type ActionError = { scheduleId: string | null; message: string } | null;

export function RecurringScreen() {
<<<<<<< HEAD
  const { movements, loading, error, reload } = useRecurringMovements();
  const incomeCategoriesState = useCategories('ingreso');
  const expenseCategoriesState = useCategories('gasto');
=======
  const { schedules, loading, error, reload } = useRecurringMovements();
  const expenseCategories = useCategories('gasto');
  const incomeCategories = useCategories('ingreso');
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<ActionError>(null);
  const [saving, setSaving] = useState(false);

  const categoryNames = new Map(
    [...expenseCategories.categories, ...incomeCategories.categories].map((c) => [c.id, c.nombre]),
  );
<<<<<<< HEAD
  const categoryNames = useMemo(
    () =>
      new Map(
        [...incomeCategoriesState.categories, ...expenseCategoriesState.categories].map((category) => [
          category.id,
          category.nombre,
        ]),
      ),
    [incomeCategoriesState.categories, expenseCategoriesState.categories],
  );
  const currentDate = todayIso();
  const activeMovements = movements.filter((movement) => movement.activo);
  const pausedMovements = movements.filter((movement) => !movement.activo);
  const selectedCategoriesState =
    form?.type === 'ingreso' ? incomeCategoriesState : expenseCategoriesState;

  function openCreateForm() {
    setActionError(null);
    setFormError(null);
    setForm({
      mode: 'create',
      schedule: null,
      type: 'gasto',
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
      type: schedule.tipo,
      amount: schedule.monto_esperado,
      categoryId: schedule.categoria_id,
      frequency: schedule.frecuencia,
      startDate: schedule.fecha_inicio,
      description: schedule.descripcion ?? '',
    });
  }

  async function performAction(operation: () => Promise<unknown>, onSuccess?: () => void) {
=======
  const categoriesError = expenseCategories.error ?? incomeCategories.error;
  const today = todayIso();
  const busy = saving || form !== null || confirmation !== null || pendingAction !== null;
  const activeSchedules = schedules.filter((s) => s.activo);
  const pausedSchedules = schedules.filter((s) => !s.activo);

  /** Ejecuta una operación y recarga la lista, tanto si funciona como si falla. */
  async function runAction(operation: () => Promise<unknown>, scheduleId: string | null): Promise<boolean> {
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    setSaving(true);
    setActionError(null);
    let succeeded = false;
    try {
      await operation();
      succeeded = true;
    } catch (operationError) {
      setActionError({ scheduleId, message: getErrorMessage(operationError) });
    }
    await reload();
    setSaving(false);
    return succeeded;
  }

  function openForm(schedule: MovimientoRecurrente | null) {
    setActionError(null);
    setForm({
      schedule,
      type: schedule?.tipo ?? 'gasto',
      amount: schedule?.monto_esperado ?? null,
      categoryId: schedule?.categoria_id ?? null,
      frequency: schedule?.frecuencia ?? 'mensual',
      startDate: schedule?.fecha_inicio ?? today,
      description: schedule?.descripcion ?? '',
    });
  }

  async function saveForm() {
    if (!form || !form.categoryId || !isPositiveAmount(form.amount)) return;

    const { schedule, type, startDate } = form;
    const fields = {
      categoria_id: form.categoryId,
      monto_esperado: form.amount,
      frecuencia: form.frequency,
      descripcion: form.description.trim() || null,
    };
<<<<<<< HEAD

    if (form.mode === 'create') {
      const input: RecurringMovementInput = {
        ...commonFields,
        tipo: form.type,
        fecha_inicio: form.startDate,
        proxima_fecha: form.startDate,
      };
      await performAction(() => createRecurringMovement(input), () => setForm(null));
      return;
    }

    if (!form.schedule) return;
    const schedule = form.schedule;
    const input: RecurringMovementUpdate = commonFields;
    await performAction(() => updateRecurringMovement(schedule.id, schedule.tipo, input), () => setForm(null));
  }

  async function resolveOccurrence(
    schedule: MovimientoRecurrente,
    action: RecurringMovementAction,
    amount: number | null,
  ) {
    await performAction(
      () => resolveRecurringMovementOccurrence(schedule, action, amount),
      () => {
        setConfirming(null);
        setPendingAction(null);
      },
=======
    const succeeded = await runAction(
      () =>
        schedule
          ? updateRecurring(schedule.id, fields)
          : createRecurring({ ...fields, tipo: type, fecha_inicio: startDate, proxima_fecha: startDate }),
      null,
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    );
    if (succeeded) setForm(null);
  }

  // La confirmación se cierra aunque falle: la ocurrencia pudo cambiar y no debe
  // reintentarse sobre la siguiente fecha sin que el usuario la revise.
  async function confirmOccurrence() {
    if (!confirmation) return;
    const { schedule, amount } = confirmation;
    await runAction(() => resolveRecurringOccurrence(schedule, 'confirmar', amount), schedule.id);
    setConfirmation(null);
  }

  async function runPendingAction() {
    if (!pendingAction) return;
<<<<<<< HEAD

    if (pendingAction.type === 'skip') {
      await resolveOccurrence(pendingAction.schedule, 'omitir', null);
      return;
    }

    await performAction(
      () => deleteRecurringMovement(pendingAction.schedule.id, pendingAction.schedule.tipo),
      () => setPendingAction(null),
    );
  }

  function renderMovement(schedule: MovimientoRecurrente) {
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
          title={categoryNames.get(schedule.categoria_id) ?? (schedule.tipo === 'ingreso' ? 'Ingreso recurrente' : 'Gasto recurrente')}
          subtitle={`${status} · ${formatDate(schedule.proxima_fecha)} · ${FREQUENCY_LABELS[schedule.frecuencia]}`}
          rightText={formatCurrency(schedule.monto_esperado)}
          rightColor={schedule.tipo === 'ingreso' ? Palette.success : Palette.danger}
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
            onPress={() =>
              void performAction(() =>
                setRecurringMovementActive(schedule.id, schedule.tipo, !schedule.activo),
              )
            }
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
            <ThemedText type="smallBold">
              Confirmar {schedule.tipo === 'ingreso' ? 'ingreso' : 'gasto'} del {formatDate(schedule.proxima_fecha)}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Se registrará el monto real y se programará la siguiente fecha.
            </ThemedText>
            <MoneyInput
              label="Monto real"
              value={confirming.amount}
              onChange={(amount) => setConfirming({ ...confirming, amount })}
              error={confirming.amount !== null && !isPositiveAmount(confirming.amount) ? 'El monto debe ser mayor que cero.' : undefined}
            />
            {actionError ? <ErrorState message={actionError} /> : null}
            <Button
              label={`Guardar ${schedule.tipo === 'ingreso' ? 'ingreso' : 'gasto'}`}
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
=======
    const { type, schedule } = pendingAction;
    await runAction(
      () => (type === 'skip' ? resolveRecurringOccurrence(schedule, 'omitir', null) : deleteRecurring(schedule.id)),
      schedule.id,
    );
    setPendingAction(null);
  }

  function renderSchedule(schedule: MovimientoRecurrente) {
    return (
      <RecurringCard
        key={schedule.id}
        schedule={schedule}
        categoryName={categoryNames.get(schedule.categoria_id)}
        today={today}
        confirmation={confirmation?.schedule.id === schedule.id ? confirmation : undefined}
        disabled={busy}
        saving={saving}
        error={actionError?.scheduleId === schedule.id ? actionError.message : null}
        onEdit={() => openForm(schedule)}
        onToggleActive={() => void runAction(() => setRecurringActive(schedule.id, !schedule.activo), schedule.id)}
        onDelete={() => setPendingAction({ type: 'delete', schedule })}
        onSkip={() => setPendingAction({ type: 'skip', schedule })}
        onStartConfirm={() => {
          setActionError(null);
          setConfirmation({ schedule, amount: schedule.monto_esperado });
        }}
        onAmountChange={(amount) => setConfirmation((current) => current && { ...current, amount })}
        onConfirm={() => void confirmOccurrence()}
        onCancelConfirm={() => setConfirmation(null)}
      />
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Movimientos recurrentes</ThemedText>
      <ThemedText themeColor="textSecondary">
        Programa ingresos y gastos que se repiten. Solo al confirmar una ocurrencia se registra como movimiento real.
      </ThemedText>
<<<<<<< HEAD
      <Button
        label="Programar movimiento"
        onPress={openCreateForm}
        disabled={saving || form !== null || confirming !== null || pendingAction !== null}
      />
      {actionError && !confirming ? <ErrorState message={actionError} /> : null}

      {form ? (
        <Card>
          <ThemedText type="subtitle">
            {form.mode === 'create' ? 'Nueva programación' : 'Editar movimiento recurrente'}
          </ThemedText>
          {form.mode === 'create' ? (
            <View style={styles.frequencySelector}>
              <ThemedText type="smallBold">Tipo</ThemedText>
              <View style={styles.actions}>
                <Button
                  label="Ingreso"
                  variant={form.type === 'ingreso' ? 'primary' : 'secondary'}
                  onPress={() => {
                    setForm({ ...form, type: 'ingreso', categoryId: null });
                    setFormError(null);
                  }}
                />
                <Button
                  label="Gasto"
                  variant={form.type === 'gasto' ? 'primary' : 'secondary'}
                  onPress={() => {
                    setForm({ ...form, type: 'gasto', categoryId: null });
                    setFormError(null);
                  }}
                />
              </View>
            </View>
          ) : (
            <ThemedText themeColor="textSecondary">
              Tipo: {form.type === 'ingreso' ? 'Ingreso' : 'Gasto'} (no se puede cambiar al editar).
            </ThemedText>
          )}
          {selectedCategoriesState.error ? (
            <ErrorState
              message={selectedCategoriesState.error}
              onRetry={() => void selectedCategoriesState.reload()}
            />
          ) : null}
          {selectedCategoriesState.loading ? <LoadingState message="Cargando categorías" /> : null}
          {!selectedCategoriesState.loading &&
          !selectedCategoriesState.error &&
          selectedCategoriesState.categories.length === 0 ? (
            <EmptyState message={`No hay categorías de ${form.type === 'ingreso' ? 'ingresos' : 'gastos'} disponibles.`} />
          ) : null}
          <MoneyInput
            label="Monto esperado"
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
            error={formError && !isPositiveAmount(form.amount) ? formError : undefined}
          />
          {!selectedCategoriesState.loading &&
          !selectedCategoriesState.error &&
          selectedCategoriesState.categories.length > 0 ? (
            <CategoryPicker
              categories={selectedCategoriesState.categories}
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
              selectedCategoriesState.loading ||
              selectedCategoriesState.error !== null ||
              selectedCategoriesState.categories.length === 0 ||
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

      {loading && movements.length === 0 ? <LoadingState message="Cargando movimientos recurrentes" /> : null}
      {error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}
      {!loading && !error && movements.length === 0 ? (
        <EmptyState message="Todavía no tienes movimientos recurrentes programados." />
=======
      <Button label="Programar movimiento" onPress={() => openForm(null)} disabled={busy} />

      {form ? (
        <RecurringForm
          form={form}
          onChange={setForm}
          onSave={() => void saveForm()}
          onCancel={() => {
            setForm(null);
            setActionError(null);
          }}
          saving={saving}
          error={actionError?.scheduleId === null ? actionError.message : null}
        />
      ) : null}

      {categoriesError ? (
        <ErrorState
          message={categoriesError}
          onRetry={() => {
            void expenseCategories.reload();
            void incomeCategories.reload();
          }}
        />
      ) : null}
      {/* Si la programación ya no está en la lista, su error se muestra aquí. */}
      {actionError?.scheduleId && !schedules.some((s) => s.id === actionError.scheduleId) ? (
        <ErrorState message={actionError.message} />
      ) : null}
      {loading && schedules.length === 0 ? <LoadingState message="Cargando movimientos recurrentes" /> : null}
      {error ? <ErrorState message={error} onRetry={() => void reload()} /> : null}
      {!loading && !error && schedules.length === 0 ? (
        <EmptyState message="Todavía no tienes movimientos recurrentes programados." />
      ) : null}
      {activeSchedules.length > 0 ? (
        <>
          <ThemedText type="subtitle">Activos</ThemedText>
          {activeSchedules.map(renderSchedule)}
        </>
      ) : null}
      {pausedSchedules.length > 0 ? (
        <>
          <ThemedText type="subtitle">Pausados</ThemedText>
          {pausedSchedules.map(renderSchedule)}
        </>
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
      ) : null}
      {renderMovementGroup(
        'Ingresos activos',
        activeMovements.filter((movement) => movement.tipo === 'ingreso'),
        renderMovement,
      )}
      {renderMovementGroup(
        'Gastos activos',
        activeMovements.filter((movement) => movement.tipo === 'gasto'),
        renderMovement,
      )}
      {renderMovementGroup(
        'Ingresos pausados',
        pausedMovements.filter((movement) => movement.tipo === 'ingreso'),
        renderMovement,
      )}
      {renderMovementGroup(
        'Gastos pausados',
        pausedMovements.filter((movement) => movement.tipo === 'gasto'),
        renderMovement,
      )}

      <ConfirmModal
        visible={pendingAction !== null}
        title={pendingAction?.type === 'skip' ? '¿Omitir esta ocurrencia?' : '¿Eliminar esta programación?'}
        message={
          pendingAction?.type === 'skip'
<<<<<<< HEAD
            ? `No se creará un movimiento y la siguiente fecha será calculada desde ${formatDate(pendingAction.schedule.proxima_fecha)}.${actionError ? `\n${actionError}` : ''}`
            : `Los movimientos confirmados se conservarán.${actionError ? `\n${actionError}` : ''}`
=======
            ? `No se creará un movimiento. La siguiente fecha se calculará desde ${formatDate(pendingAction.schedule.proxima_fecha)}.`
            : 'La programación se eliminará. No se puede eliminar si ya tiene movimientos confirmados.'
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
        }
        confirmLabel={pendingAction?.type === 'skip' ? 'Omitir' : 'Eliminar'}
        destructive={pendingAction?.type === 'delete'}
        loading={saving}
        onConfirm={() => void runPendingAction()}
        onCancel={() => setPendingAction(null)}
      />
    </ScreenContainer>
  );
}
<<<<<<< HEAD

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

function renderMovementGroup(
  title: string,
  items: MovimientoRecurrente[],
  renderItem: (schedule: MovimientoRecurrente) => ReactNode,
) {
  if (items.length === 0) return null;
  return (
    <View style={styles.group}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {items.map(renderItem)}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  confirmForm: { gap: 10, marginTop: 8 },
  frequencySelector: { gap: 6 },
  group: { gap: 8 },
  errorText: { color: '#DC2626' },
});
=======
>>>>>>> cbb80e1aeb902a56a30ae7daa779bb08ee67af77
