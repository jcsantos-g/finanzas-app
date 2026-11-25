import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ScreenContainer, TextField } from '@/components/ui';
import { signIn } from '@/features/auth/service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      Alert.alert('No se pudo iniciar sesión', e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Iniciar sesión</ThemedText>
      <TextField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      <Button label="Entrar" onPress={onSubmit} loading={loading} disabled={!email || !password} />
      <Link href="/forgot-password"><ThemedText type="link">¿Olvidaste tu contraseña?</ThemedText></Link>
      <Link href="/register"><ThemedText type="link">Crear cuenta</ThemedText></Link>
    </ScreenContainer>
  );
}
