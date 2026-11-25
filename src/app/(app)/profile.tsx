import { ThemedText } from '@/components/themed-text';
import { Button, ScreenContainer } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/service';

export default function ProfileRoute() {
  const { session } = useAuth();
  return (
    <ScreenContainer>
      <ThemedText type="subtitle">Cuenta</ThemedText>
      <ThemedText themeColor="textSecondary">{session?.user.email}</ThemedText>
      <Button label="Cerrar sesión" variant="danger" onPress={() => signOut()} />
    </ScreenContainer>
  );
}
