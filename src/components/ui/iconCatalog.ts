import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

/** Nombre de un ícono de MaterialCommunityIcons (TypeScript valida que exista). */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Catálogo de íconos de categorías: "clave que se guarda en la base" -> "ícono que se dibuja".
 *
 * La columna `categorias.icono` guarda SOLO la clave (ej. 'alimentacion'), nunca un emoji ni el
 * nombre de la librería. Así, si algún día se cambia de librería, solo se edita este archivo.
 * Para agregar un ícono nuevo: añade una línea aquí (y a docs/components.md).
 */
export const CATEGORY_ICONS = {
  // Ingresos
  salario: 'briefcase',
  negocio: 'store',
  regalos: 'gift',
  otros_ingresos: 'plus-circle',
  inversion: 'chart-line',
  // Gastos
  alimentacion: 'silverware-fork-knife',
  transporte: 'bus',
  vivienda: 'home',
  servicios: 'lightbulb-on',
  salud: 'heart-pulse',
  educacion: 'school',
  entretenimiento: 'movie-open',
  compras: 'shopping',
  viajes: 'airplane',
  mascotas: 'paw',
  ahorro: 'piggy-bank',
  tarjeta: 'credit-card',
  otros_gastos: 'minus-circle',
} as const satisfies Record<string, IconName>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

/** Ícono que se muestra cuando la clave es nula o desconocida. */
export const DEFAULT_CATEGORY_ICON: IconName = 'tag';

export function iconNameForCategory(clave: string | null | undefined): IconName {
  if (clave && clave in CATEGORY_ICONS) return CATEGORY_ICONS[clave as CategoryIconKey];
  return DEFAULT_CATEGORY_ICON;
}
