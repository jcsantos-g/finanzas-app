const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** 1234.5 -> "$1,234.50". Cambiar la moneda aquí si el equipo decide otra. */
export function formatCurrency(amount: number): string {
  return currency.format(amount);
}

/** "2026-03-15" -> "15 mar 2026" */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
