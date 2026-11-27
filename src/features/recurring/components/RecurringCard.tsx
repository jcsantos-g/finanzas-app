import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, ErrorState, ListItem, MoneyInput } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';
import type { MovimientoRecurrente } from '@/types/database';

import { FREQUENCY_LABELS, TYPE_LABELS } from '../labels';

type Props = {
  schedule: MovimientoRecurrente;
  categoryName: string | undefined;
  today: string;
  /** Presente solo mientras se confirma esta ocurrencia. */
  confirmation: { amount: number | null } | undefined;
  disabled: boolean;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSkip: () => void;
  onStartConfirm: () => void;
  onAmountChange: (amount: number | null) => void;
  onConfirm: () => void;
  onCancelConfirm: () => void;
};

function statusLabel(schedule: MovimientoRecurrente, today: string): string {
  if (!schedule.activo) return 'Pausado';
  if (schedule.proxima_fecha < today) return 'Vencido';
  return schedule.proxima_fecha === today ? 'Pendiente hoy' : 'Próximo';
}

export function RecurringCard({
  schedule,
  categoryName,
  today,
  confirmation,
  disabled,
  saving,
  error,
  onEdit,
  onToggleActive,
  onDelete,
  onSkip,
  onStartConfirm,
  onAmountChange,
  onConfirm,
  onCancelConfirm,
}: Props) {
  const typeLabel = TYPE_LABELS[schedule.tipo];
  const isPending = schedule.activo && schedule.proxima_fecha <= today;

  return (
    <Card>
      <ListItem
        title={`${typeLabel} · ${categoryName ?? 'Sin categoría'}`}
        subtitle={`${statusLabel(schedule, today)} · ${formatDate(schedule.proxima_fecha)} · ${FREQUENCY_LABELS[schedule.frecuencia]}`}
        rightText={formatCurrency(schedule.monto_esperado)}
        rightColor={schedule.tipo === 'ingreso' ? Palette.success : Palette.danger}
      />
      {schedule.descripcion ? <ThemedText themeColor="textSecondary">{schedule.descripcion}</ThemedText> : null}
      {error ? <ErrorState message={error} /> : null}
      <View style={styles.actions}>
        <Button label="Editar" variant="secondary" onPress={onEdit} disabled={disabled} />
        <Button
          label={schedule.activo ? 'Pausar' : 'Reanudar'}
          variant="secondary"
          onPress={onToggleActive}
          disabled={disabled}
        />
        <Button label="Eliminar" variant="danger" onPress={onDelete} disabled={disabled} />
      </View>
      {isPending && !confirmation ? (
        <View style={styles.actions}>
          <Button label="Confirmar ocurrencia" onPress={onStartConfirm} disabled={disabled} />
          <Button label="Omitir" variant="secondary" onPress={onSkip} disabled={disabled} />
        </View>
      ) : null}
      {confirmation ? (
        <View style={styles.confirmForm}>
          <ThemedText type="smallBold">
            Confirmar {typeLabel.toLowerCase()} del {formatDate(schedule.proxima_fecha)}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Se registrará el monto real como un {typeLabel.toLowerCase()} y se programará la siguiente fecha.
          </ThemedText>
          <MoneyInput
            label="Monto real"
            value={confirmation.amount}
            onChange={onAmountChange}
            error={
              confirmation.amount !== null && !isPositiveAmount(confirmation.amount)
                ? 'El monto debe ser mayor que cero.'
                : undefined
            }
          />
          <Button
            label={`Guardar ${typeLabel.toLowerCase()}`}
            onPress={onConfirm}
            loading={saving}
            disabled={!isPositiveAmount(confirmation.amount)}
          />
          <Button label="Cancelar" variant="secondary" onPress={onCancelConfirm} disabled={saving} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  confirmForm: { gap: 10, marginTop: 8 },
});
