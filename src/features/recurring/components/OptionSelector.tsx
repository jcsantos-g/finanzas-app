import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui';

type Props<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// TODO: mover a ui/
export function OptionSelector<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.options}>
        {options.map((option) => (
          <Button
            key={option.value}
            label={option.label}
            variant={value === option.value ? 'primary' : 'secondary'}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
