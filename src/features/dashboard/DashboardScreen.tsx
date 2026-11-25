import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, Icon, ScreenContainer, type IconName } from '@/components/ui';

// RF-04: el Dashboard es solo un menú de tarjetas, sin gráficos ni estadísticas.
const ITEMS: { title: string; icon: IconName; href: Href }[] = [
  { title: 'Ingresos', icon: 'cash-plus', href: '/income' },
  { title: 'Gastos', icon: 'cash-minus', href: '/expenses' },
  { title: 'Recurrentes', icon: 'calendar-sync', href: '/recurring' },
  { title: 'Presupuestos', icon: 'target', href: '/budgets' },
  { title: 'Reportes', icon: 'chart-pie', href: '/reports' },
  { title: 'Perfil', icon: 'account-circle', href: '/profile' },
  // { title: 'Escanear ticket', icon: 'camera', href: '/scan' }, // funcionalidad adicional (IA)
];

export function DashboardScreen() {
  const router = useRouter();
  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Mis finanzas</ThemedText>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Card key={item.title} style={styles.cell} onPress={() => router.push(item.href)}>
            <Icon name={item.icon} size={36} />
            <ThemedText type="smallBold">{item.title}</ThemedText>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47%', minHeight: 110, justifyContent: 'center', alignItems: 'center', gap: 8 },
});
