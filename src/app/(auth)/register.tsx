import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ScreenContainer, TextField } from '@/components/ui';
import { signUp } from '@/features/auth/service';
import { isValidEmail } from '@/lib/validators';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = email && !isValidEmail(email) ? 'Correo no válido' : undefined;
  const passwordError = password && password.length < 6 ? 'Mínimo 6 caracteres' : undefined;

  async function onSubmit() {
    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert('Cuenta creada', 'Si tu proyecto exige confirmar el correo, revisa tu bandeja.');
    } catch (e) {
      Alert.alert('No se pudo registrar', e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Crear cuenta</ThemedText>
      <TextField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" error={emailError} />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry error={passwordError} />
      <Button label="Registrarme" onPress={onSubmit} loading={loading} disabled={!isValidEmail(email) || password.length < 6} />
      <Link href="/login"><ThemedText type="link">Ya tengo cuenta</ThemedText></Link>
    </ScreenContainer>
  );
}
