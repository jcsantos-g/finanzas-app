import { Redirect } from 'expo-router';

/**
 * Sin sesión, la ruta "/" solo puede caer en el grupo (auth). Esta pantalla evita el
 * error "Unmatched Route" al arrancar y envía al usuario al inicio de sesión.
 * (Con sesión iniciada, "/" corresponde a src/app/(app)/index.tsx, el Dashboard.)
 */
export default function AuthIndex() {
  return <Redirect href="/login" />;
}
