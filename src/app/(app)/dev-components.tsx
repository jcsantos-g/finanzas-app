import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import {
  Button,
  CategoryPicker,
  Card,
  ConfirmModal,
  DatePickerField,
  EmptyState,
  ErrorState,
  ListItem,
  LoadingState,
  MoneyInput,
  ProgressBar,
  ScreenContainer,
  TextField,
} from '@/components/ui';
import { Palette } from '@/constants/theme';
import { todayIso } from '@/lib/dates';
import { formatCurrency } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';

const DEMO_CATEGORIES = [
  { id: '1', name: 'Alimentación', icon: '🍽️' },
  { id: '2', name: 'Transporte', icon: '🚌' },
  { id: '3', name: 'Salud', icon: '🩺' },
];

/**
 * Catálogo visual de componentes (solo desarrollo). Cada componente nuevo de
 * components/ui debe agregarse aquí con datos de ejemplo. Ver docs/components.md.
 */
export default function DevComponentsRoute() {
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(todayIso());
  const [category, setCategory] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [modal, setModal] = useState(false);

  return (
    <ScreenContainer scroll>
      <ThemedText type="subtitle">Componentes</ThemedText>

      <ThemedText type="smallBold">Button</ThemedText>
      <Button label="Primario" onPress={() => {}} />
      <Button label="Secundario" variant="secondary" onPress={() => {}} />
      <Button label="Peligro" variant="danger" onPress={() => {}} />
      <Button label="Cargando" loading onPress={() => {}} />

      <ThemedText type="smallBold">TextField</ThemedText>
      <TextField label="Descripción" value={text} onChangeText={setText} />
      <TextField label="Con error" value="" onChangeText={() => {}} error="Campo obligatorio" />

      <ThemedText type="smallBold">MoneyInput</ThemedText>
      <MoneyInput
        value={amount}
        onChange={setAmount}
        error={amount !== null && !isPositiveAmount(amount) ? 'Debe ser mayor que cero' : undefined}
      />
      <ThemedText themeColor="textSecondary">
        Valor: {amount === null ? 'vacío' : formatCurrency(amount)}
      </ThemedText>

      <ThemedText type="smallBold">DatePickerField</ThemedText>
      <DatePickerField value={date} onChange={setDate} />

      <ThemedText type="smallBold">CategoryPicker</ThemedText>
      <CategoryPicker categories={DEMO_CATEGORIES} value={category} onChange={setCategory} />

      <ThemedText type="smallBold">Card y ListItem</ThemedText>
      <Card>
        <ThemedText>Contenido de una tarjeta</ThemedText>
      </Card>
      <ListItem title="Supermercado" subtitle="Alimentación · 12 mar" rightText={formatCurrency(-350)} rightColor={Palette.danger} />
      <ListItem title="Salario" subtitle="Ingreso · 1 mar" rightText={formatCurrency(12000)} rightColor={Palette.success} />

      <ThemedText type="smallBold">ProgressBar</ThemedText>
      <ProgressBar value={30} max={100} />
      <ProgressBar value={85} max={100} />
      <ProgressBar value={130} max={100} />

      <ThemedText type="smallBold">ConfirmModal</ThemedText>
      <Button label="Abrir diálogo" variant="secondary" onPress={() => setModal(true)} />
      <ConfirmModal
        visible={modal}
        title="¿Eliminar movimiento?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => setModal(false)}
        onCancel={() => setModal(false)}
      />

      <ThemedText type="smallBold">Estados</ThemedText>
      <EmptyState message="Aún no hay movimientos" actionLabel="Agregar el primero" onAction={() => {}} />
      <LoadingState message="Cargando…" />
      <ErrorState message="No se pudo cargar" onRetry={() => {}} />
    </ScreenContainer>
  );
}
