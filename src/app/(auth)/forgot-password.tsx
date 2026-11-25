import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ScreenContainer, TextField } from '@/components/ui';
import { requestPasswordReset } from '@/features/auth/service';
import { isValidEmail } from '@/lib/validators';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      await requestPasswordReset(email);
      Alert.alert('Revisa tu correo', 'Te enviamos las instrucciones para restablecer tu contraseña.');
    } catch (e) {
      Alert.alert('No se pudo enviar', e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Recuperar contraseña</ThemedText>
      <TextField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      <Button label="Enviar instrucciones" onPress={onSubmit} loading={loading} disabled={!isValidEmail(email)} />
      <Link href="/login"><ThemedText type="link">Volver</ThemedText></Link>
    </ScreenContainer>
  );
}
