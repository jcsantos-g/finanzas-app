import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = ViewProps & { onPress?: () => void };

export function Card({ onPress, style, children, ...rest }: Props) {
  const theme = useTheme();
  const base = [styles.card, { backgroundColor: theme.backgroundElement }, style];

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 4 },
  pressed: { opacity: 0.85 },
});
