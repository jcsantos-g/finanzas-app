import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="income" options={{ title: 'Ingresos' }} />
      <Stack.Screen name="expenses" options={{ title: 'Gastos' }} />
      <Stack.Screen name="transaction-form" options={{ title: 'Movimiento', presentation: 'modal' }} />
      <Stack.Screen name="recurring" options={{ title: 'Movimientos recurrentes' }} />
      <Stack.Screen name="budgets" options={{ title: 'Presupuestos' }} />
      <Stack.Screen name="reports" options={{ title: 'Reportes' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil y configuración' }} />
    </Stack>
  );
}
