import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types/database';

type Props = {
  label?: string;
  /** Categorías ya filtradas por tipo (ver useCategories en features/categories). */
  categories: Pick<Category, 'id' | 'name' | 'icon'>[];
  value: string | null;
  onChange: (categoryId: string) => void;
  error?: string;
};

/** Selector de categoría en forma de etiquetas. Es presentacional: no consulta datos. */
export function CategoryPicker({ label = 'Categoría', categories, value, onChange, error }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={styles.chips}>
        {categories.map((c) => {
          const active = c.id === value;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(c.id)}
              style={[styles.chip, { backgroundColor: active ? Palette.primary : theme.backgroundElement }]}>
              <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  error: { color: Palette.danger, fontSize: 13 },
});
