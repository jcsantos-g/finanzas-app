import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';

import { iconNameForCategory, type IconName } from './iconCatalog';

type IconProps = {
  /** Nombre de un ícono de MaterialCommunityIcons (https://pictogrammers.com/library/mdi/). */
  name: IconName;
  size?: number;
  /** Si se omite, usa el color de texto del tema (claro u oscuro). */
  color?: string;
};

/** Ícono vectorial genérico (menús, botones, etc.). */
export function Icon({ name, size = 24, color }: IconProps) {
  const theme = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? theme.text} />;
}

type CategoryIconProps = {
  /** Valor de la columna `categorias.icono` (clave del catálogo). Admite null. */
  clave: string | null | undefined;
  size?: number;
  color?: string;
};

/** Ícono de una categoría a partir de la clave guardada en la base de datos. */
export function CategoryIcon({ clave, size, color }: CategoryIconProps) {
  return <Icon name={iconNameForCategory(clave)} size={size} color={color} />;
}
