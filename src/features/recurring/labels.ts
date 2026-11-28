import type { Frecuencia, TipoMovimiento } from '@/types/database';

export const TYPE_LABELS: Record<TipoMovimiento, string> = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
};

export const FREQUENCY_LABELS: Record<Frecuencia, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
};

export const TYPE_OPTIONS: { value: TipoMovimiento; label: string }[] = [
  { value: 'gasto', label: TYPE_LABELS.gasto },
  { value: 'ingreso', label: TYPE_LABELS.ingreso },
];

export const FREQUENCY_OPTIONS: { value: Frecuencia; label: string }[] = [
  { value: 'semanal', label: FREQUENCY_LABELS.semanal },
  { value: 'quincenal', label: FREQUENCY_LABELS.quincenal },
  { value: 'mensual', label: FREQUENCY_LABELS.mensual },
];
