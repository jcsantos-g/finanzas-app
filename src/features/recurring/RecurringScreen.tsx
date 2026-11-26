import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, ConfirmModal, EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui';
import { useCategories } from '@/features/categories/useCategories';
import { todayIso } from '@/lib/dates';
import { formatDate } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';
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

type PendingAction = { type: 'skip' | 'delete'; schedule: MovimientoRecurrente } | null;
type Confirmation = { schedule: MovimientoRecurrente; amount: number | null } | null;
/** `scheduleId` es null cuando el error viene del formulario. */
type ActionError = { scheduleId: string | null; message: string } | null;

export function RecurringScreen() {
  const { schedules, loading, error, reload } = useRecurringMovements();
  const expenseCategories = useCategories('gasto');
  const incomeCategories = useCategories('ingreso');
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<ActionError>(null);
  const [saving, setSaving] = useState(false);

  const categoryNames = new Map(
    [...expenseCategories.categories, ...incomeCategories.categories].map((c) => [c.id, c.nombre]),
  );
  const categoriesError = expenseCategories.error ?? incomeCategories.error;
  const today = todayIso();
  const busy = saving || form !== null || confirmation !== null || pendingAction !== null;
  const activeSchedules = schedules.filter((s) => s.activo);
  const pausedSchedules = schedules.filter((s) => !s.activo);

  /** Ejecuta una operación y recarga la lista, tanto si funciona como si falla. */
  async function runAction(operation: () => Promise<unknown>, scheduleId: string | null): Promise<boolean> {
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
    const succeeded = await runAction(
      () =>
        schedule
          ? updateRecurring(schedule.id, fields)
          : createRecurring({ ...fields, tipo: type, fecha_inicio: startDate, proxima_fecha: startDate }),
      null,
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
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Movimientos recurrentes</ThemedText>
      <ThemedText themeColor="textSecondary">
        Programa ingresos y gastos que se repiten. Solo al confirmar una ocurrencia se registra como movimiento real.
      </ThemedText>
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
      ) : null}

      <ConfirmModal
        visible={pendingAction !== null}
        title={pendingAction?.type === 'skip' ? '¿Omitir esta ocurrencia?' : '¿Eliminar esta programación?'}
        message={
          pendingAction?.type === 'skip'
            ? `No se creará un movimiento. La siguiente fecha se calculará desde ${formatDate(pendingAction.schedule.proxima_fecha)}.`
            : 'La programación se eliminará. No se puede eliminar si ya tiene movimientos confirmados.'
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
