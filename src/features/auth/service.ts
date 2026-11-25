import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw error;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Envía el correo de recuperación. La URL de redirección se configura al armar el flujo completo. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw error;
}
