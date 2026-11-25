import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
};

const COLORS = {
  primary: { bg: '#2563EB', fg: '#FFFFFF' },
  secondary: { bg: '#E5E7EB', fg: '#111827' },
  danger: { bg: '#DC2626', fg: '#FFFFFF' },
} as const;

export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const { bg, fg } = COLORS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: inactive ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.label, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  label: { fontSize: 16, fontWeight: '600' },
});
