import type { Frequency } from '@/types/database';

/** Fechas como texto ISO "YYYY-MM-DD" para evitar problemas de zona horaria. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

function parse(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month: 1-12
}

/** Primer y último día de un mes (month: 1-12). */
export function monthRange(year: number, month: number): { start: string; end: string } {
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(daysInMonth(year, month))}`,
  };
}

/**
 * Siguiente fecha programada a partir de la fecha programada ANTERIOR (RN-09).
 * Mensual: si el día no existe en el mes destino, usa el último día (RN-10).
 * `anchorDay` es el día original de la programación (start_date); evita que
 * 31 ene -> 28 feb -> 28 mar. Con anchorDay se obtiene 31 ene -> 28 feb -> 31 mar.
 */
export function addInterval(isoDate: string, frequency: Frequency, anchorDay?: number): string {
  const { y, m, d } = parse(isoDate);

  if (frequency === 'weekly' || frequency === 'biweekly') {
    const next = new Date(y, m - 1, d + (frequency === 'weekly' ? 7 : 14));
    return toIsoDate(next);
  }

  const targetMonthIndex = m; // mes siguiente, base 0 => m
  const ny = y + Math.floor(targetMonthIndex / 12);
  const nm = (targetMonthIndex % 12) + 1;
  const day = Math.min(anchorDay ?? d, daysInMonth(ny, nm));
  return `${ny}-${pad(nm)}-${pad(day)}`;
}
