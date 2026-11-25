import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

type Props = ViewProps & { scroll?: boolean };

/** Contenedor base de pantalla: área segura, fondo del tema y padding. */
export function ScreenContainer({ scroll = false, style, children, ...rest }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 };

  if (scroll) {
    return (
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, padding, style]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      style={[styles.content, styles.flex, { backgroundColor: theme.background }, padding, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
});
