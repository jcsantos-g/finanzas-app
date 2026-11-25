import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  Button,
  CategoryIcon,
  CategoryPicker,
  CATEGORY_ICONS,
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
import { useTheme } from '@/hooks/use-theme';
import { todayIso } from '@/lib/dates';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { isPositiveAmount } from '@/lib/validators';

const DEMO_CATEGORIES = [
  { id: '1', nombre: 'Alimentación', icono: 'alimentacion' },
  { id: '2', nombre: 'Transporte', icono: 'transporte' },
  { id: '3', nombre: 'Salud', icono: 'salud' },
];

type DemoState = 'vacio' | 'cargando' | 'error';

/**
 * Catálogo visual de componentes (solo desarrollo). Cada componente nuevo de
 * components/ui debe agregarse aquí, en su sección y con una explicación.
 * Ver docs/components.md.
 */
export default function DevComponentsRoute() {
  const [pressed, setPressed] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(todayIso());
  const [category, setCategory] = useState<string | null>(null);
  const [spent, setSpent] = useState(30);
  const [modal, setModal] = useState(false);
  const [modalResult, setModalResult] = useState<string | null>(null);
  const [demoState, setDemoState] = useState<DemoState>('vacio');

  // El ejemplo de "guardando" termina solo, como lo haría una petición real.
  useEffect(() => {
    if (!saving) return;
    const timer = setTimeout(() => {
      setSaving(false);
      setPressed('Guardado (simulado)');
    }, 2000);
    return () => clearTimeout(timer);
  }, [saving]);

  const selected = DEMO_CATEGORIES.find((c) => c.id === category);

  return (
    <ScreenContainer scroll>
      <ThemedText type="smallBold">¿Qué es esta pantalla?</ThemedText>
      <ThemedText themeColor="textSecondary">
        Es la muestra de las piezas compartidas para armar la app. Solo se ve en modo desarrollo y no
        guarda nada: todos los datos son de ejemplo. Antes de crear un botón o un campo, búscalo aquí.
      </ThemedText>

      <Section name="Button" description="Botones de acción. Tócalos para ver cómo responden.">
        <Button label="Primario (acción principal)" onPress={() => setPressed('Primario')} />
        <Button label="Secundario (cancelar)" variant="secondary" onPress={() => setPressed('Secundario')} />
        <Button label="Peligro (eliminar)" variant="danger" onPress={() => setPressed('Peligro')} />
        <Button label="Probar estado de carga (2 s)" loading={saving} onPress={() => setSaving(true)} />
        <Result text={saving ? 'Guardando…' : pressed ? `Último: ${pressed}` : 'Aún no has tocado ninguno'} />
      </Section>

      <Section name="TextField" description="Campo de texto con etiqueta y mensaje de error.">
        <TextField label="Descripción" value={text} onChangeText={setText} placeholder="Escribe algo" />
        <TextField label="Ejemplo con error" value="" onChangeText={() => {}} error="Campo obligatorio" />
      </Section>

      <Section
        name="MoneyInput"
        description="Para montos. No acepta letras ni más de 2 decimales. Prueba escribir 0.">
        <MoneyInput
          value={amount}
          onChange={setAmount}
          error={amount !== null && !isPositiveAmount(amount) ? 'Debe ser mayor que cero' : undefined}
        />
        <Result text={amount === null ? 'Sin monto' : `Entrega: ${formatCurrency(amount)}`} />
      </Section>

      <Section name="DatePickerField" description="Para fechas: usa las flechas o los atajos Hoy y Ayer.">
        <DatePickerField value={date} onChange={setDate} />
        <Result text={`Fecha elegida: ${formatDate(date)}`} />
      </Section>

      <Section name="CategoryPicker" description="Selector de categoría. Toca una para elegirla.">
        <CategoryPicker categories={DEMO_CATEGORIES} value={category} onChange={setCategory} />
        <Result text={selected ? `Elegida: ${selected.nombre}` : 'Ninguna elegida'} />
      </Section>

      <Section
        name="CategoryIcon"
        description="Claves disponibles para la columna categorias.icono y el ícono de cada una.">
        <View style={styles.icons}>
          {Object.keys(CATEGORY_ICONS).map((clave) => (
            <View key={clave} style={styles.iconCell}>
              <CategoryIcon clave={clave} size={26} />
              <ThemedText themeColor="textSecondary" style={styles.iconLabel} numberOfLines={2}>
                {clave}
              </ThemedText>
            </View>
          ))}
        </View>
      </Section>

      <Section name="Card y ListItem" description="Tarjeta genérica y fila para listas de movimientos.">
        <Card>
          <ThemedText>Contenido de una tarjeta</ThemedText>
        </Card>
        <ListItem
          title="Supermercado"
          subtitle="Alimentación · 12 mar"
          rightText={formatCurrency(-350)}
          rightColor={Palette.danger}
        />
        <ListItem
          title="Salario"
          subtitle="Ingreso · 1 mar"
          rightText={formatCurrency(12000)}
          rightColor={Palette.success}
        />
      </Section>

      <Section
        name="ProgressBar"
        description="Consumo de un presupuesto: verde, ámbar desde 80 % y rojo al pasar el límite.">
        <ProgressBar value={spent} max={100} />
        <Result text={`Usado: ${spent} % del presupuesto`} />
        <Button label="Gastar 25 % más" variant="secondary" onPress={() => setSpent((s) => s + 25)} />
        <Button label="Reiniciar" variant="secondary" onPress={() => setSpent(30)} />
      </Section>

      <Section name="ConfirmModal" description="Pide confirmación antes de una acción delicada.">
        <Button label="Abrir diálogo de eliminar" variant="secondary" onPress={() => setModal(true)} />
        <Result text={modalResult ?? 'Aún no has respondido el diálogo'} />
        <ConfirmModal
          visible={modal}
          title="¿Eliminar movimiento?"
          message="Es un ejemplo: no se borra nada."
          confirmLabel="Eliminar"
          destructive
          onConfirm={() => {
            setModal(false);
            setModalResult('Confirmaste');
          }}
          onCancel={() => {
            setModal(false);
            setModalResult('Cancelaste');
          }}
        />
      </Section>

      <Section
        name="EmptyState, LoadingState y ErrorState"
        description="Lo que ve el usuario cuando una lista está vacía, cargando o falló. Elige cuál ver. El de carga gira sin parar a propósito: en la app desaparece cuando llegan los datos.">
        <Button label="Ver lista vacía" variant="secondary" onPress={() => setDemoState('vacio')} />
        <Button label="Ver cargando" variant="secondary" onPress={() => setDemoState('cargando')} />
        <Button label="Ver error" variant="secondary" onPress={() => setDemoState('error')} />
        {demoState === 'vacio' ? (
          <EmptyState
            message="Aún no hay movimientos"
            actionLabel="Agregar el primero"
            onAction={() => setDemoState('cargando')}
          />
        ) : null}
        {demoState === 'cargando' ? <LoadingState message="Cargando… (ejemplo)" /> : null}
        {demoState === 'error' ? (
          <ErrorState message="No se pudo cargar" onRetry={() => setDemoState('cargando')} />
        ) : null}
      </Section>
    </ScreenContainer>
  );
}

/** Bloque con borde para separar visualmente cada componente. Solo se usa en esta pantalla. */
function Section({ name, description, children }: { name: string; description: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { borderColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold">{name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {description}
      </ThemedText>
      {children}
    </View>
  );
}

/** Muestra qué pasó al interactuar con el ejemplo. */
function Result({ text }: { text: string }) {
  return <Text style={styles.result}>→ {text}</Text>;
}

const styles = StyleSheet.create({
  section: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 10 },
  result: { color: Palette.primary, fontWeight: '600' },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconCell: { width: 84, alignItems: 'center', gap: 4 },
  iconLabel: { fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
