/** Los errores de Supabase son objetos con `message`; no siempre son instancias de `Error`. */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error;
    if (typeof message === 'string' && message.trim() !== '') return message;
  }
  return fallback;
}
