import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Texto a la derecha, normalmente un monto ya formateado con formatCurrency. */
  rightText?: string;
  /** Color del texto de la derecha (por ejemplo verde para ingresos, rojo para gastos). */
  rightColor?: string;
  onPress?: () => void;
};

/** Fila de lista para movimientos, recurrentes, presupuestos, etc. */
export function ListItem({ title, subtitle, rightText, rightColor, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.texts}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.textSecondary }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightText ? <Text style={[styles.right, { color: rightColor ?? theme.text }]}>{rightText}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14 },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  right: { fontSize: 16, fontWeight: '700' },
});
