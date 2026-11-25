import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, todayIso } from '@/lib/dates';
import { formatDate } from '@/lib/formatters';

type Props = {
  label?: string;
  /** Fecha en formato "YYYY-MM-DD". */
  value: string;
  onChange: (isoDate: string) => void;
};

/**
 * Selector de fecha sin dependencias nativas: flechas para avanzar o retroceder un día
 * y atajos "Hoy" / "Ayer", pensado para registrar movimientos en pocos pasos.
 */
export function DatePickerField({ label = 'Fecha', value, onChange }: Props) {
  const theme = useTheme();
  const today = todayIso();
  const yesterday = addDays(today, -1);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        <Pressable accessibilityLabel="Día anterior" onPress={() => onChange(addDays(value, -1))} style={styles.arrow}>
          <Text style={[styles.arrowText, { color: theme.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.date, { color: theme.text }]}>{formatDate(value)}</Text>
        <Pressable accessibilityLabel="Día siguiente" onPress={() => onChange(addDays(value, 1))} style={styles.arrow}>
          <Text style={[styles.arrowText, { color: theme.text }]}>›</Text>
        </Pressable>
      </View>
      <View style={styles.chips}>
        <Chip label="Hoy" active={value === today} onPress={() => onChange(today)} />
        <Chip label="Ayer" active={value === yesterday} onPress={() => onChange(yesterday)} />
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? Palette.primary : theme.backgroundSelected }]}>
      <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, minHeight: 48 },
  arrow: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 24, fontWeight: '600' },
  date: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
});
