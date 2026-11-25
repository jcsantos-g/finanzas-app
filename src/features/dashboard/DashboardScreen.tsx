import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, ScreenContainer } from '@/components/ui';

// RF-04: el Dashboard es solo un menú de tarjetas, sin gráficos ni estadísticas.
const ITEMS: { title: string; emoji: string; href: Href }[] = [
  { title: 'Ingresos', emoji: '💰', href: '/income' },
  { title: 'Gastos', emoji: '🧾', href: '/expenses' },
  { title: 'Recurrentes', emoji: '🔁', href: '/recurring' },
  { title: 'Presupuestos', emoji: '🎯', href: '/budgets' },
  { title: 'Reportes', emoji: '📊', href: '/reports' },
  { title: 'Perfil', emoji: '👤', href: '/profile' },
  // { title: 'Escanear ticket', emoji: '📷', href: '/scan' }, // funcionalidad adicional (IA)
];

export function DashboardScreen() {
  const router = useRouter();
  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Mis finanzas</ThemedText>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Card key={item.title} style={styles.cell} onPress={() => router.push(item.href)}>
            <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
            <ThemedText type="smallBold">{item.title}</ThemedText>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47%', minHeight: 110, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 32, lineHeight: 40 },
});
