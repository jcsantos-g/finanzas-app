import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#DC2626' : theme.backgroundSelected,
          },
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  error: { color: '#DC2626', fontSize: 13 },
});
