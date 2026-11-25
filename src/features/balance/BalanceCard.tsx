import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';

import { useAvailableBalance } from './useAvailableBalance';

/**
 * Tarjeta compacta con el dinero disponible. Es el único dato del Dashboard:
 * los gráficos y totales por período van en Reportes.
 */
export function BalanceCard() {
  const { balance, loading, failed, reload } = useAvailableBalance();

  let text = 'Calculando…';
  if (failed) text = 'No disponible. Toca para reintentar';
  else if (balance !== null) text = formatCurrency(balance);

  return (
    <Card onPress={failed && !loading ? reload : undefined}>
      <ThemedText type="small" themeColor="textSecondary">
        Dinero disponible
      </ThemedText>
      <ThemedText
        style={[
          failed ? styles.message : styles.amount,
          balance !== null && balance < 0 ? styles.negative : null,
        ]}>
        {text}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  amount: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  message: { fontSize: 14 },
  negative: { color: Palette.danger },
});
