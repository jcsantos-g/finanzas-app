import { ThemedText } from '@/components/themed-text';
import { Button, ScreenContainer } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/service';
import { Link } from 'expo-router';

export default function ProfileRoute() {
  const { session } = useAuth();
  return (
    <ScreenContainer>
      <ThemedText type="subtitle">Cuenta</ThemedText>
      <ThemedText themeColor="textSecondary">{session?.user.email}</ThemedText>
      <Button label="Cerrar sesión" variant="danger" onPress={() => signOut()} />
      {__DEV__ ? (
        <Link href="/dev-components">
          <ThemedText type="link">Ver catálogo de componentes (solo desarrollo)</ThemedText>
        </Link>
      ) : null}
    </ScreenContainer>
  );
}
