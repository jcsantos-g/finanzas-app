import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Cantidad usada. */
  value: number;
  /** Límite (por ejemplo, el presupuesto). Si es 0 o menos, la barra se muestra vacía. */
  max: number;
  /** Color fijo. Si se omite: verde, ámbar desde 80 % y rojo al superar el límite. */
  color?: string;
};

/** Barra de consumo, pensada para presupuestos. */
export function ProgressBar({ value, max, color }: Props) {
  const theme = useTheme();
  const ratio = max > 0 ? value / max : 0;
  const width = `${Math.min(Math.max(ratio, 0), 1) * 100}%` as const;
  const auto = ratio > 1 ? Palette.danger : ratio >= 0.8 ? Palette.warning : Palette.success;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: Math.max(max, 0), now: Math.max(value, 0) }}
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width, backgroundColor: color ?? auto }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
