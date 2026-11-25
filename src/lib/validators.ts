/** RN-02: todo monto debe ser mayor que cero. */
export function isPositiveAmount(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Convierte texto de un campo ("1,250.50") a número, o null si no es válido. */
export function parseAmount(text: string): number | null {
  const n = Number(text.replace(/,/g, '').trim());
  return Number.isFinite(n) && text.trim() !== '' ? n : null;
}
