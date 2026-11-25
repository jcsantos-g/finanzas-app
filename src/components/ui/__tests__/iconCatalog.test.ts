import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, iconNameForCategory } from '../iconCatalog';

describe('iconNameForCategory', () => {
  it('traduce una clave conocida a su ícono', () => {
    expect(iconNameForCategory('alimentacion')).toBe(CATEGORY_ICONS.alimentacion);
  });

  it('usa el ícono genérico con claves nulas, vacías o desconocidas', () => {
    expect(iconNameForCategory(null)).toBe(DEFAULT_CATEGORY_ICON);
    expect(iconNameForCategory(undefined)).toBe(DEFAULT_CATEGORY_ICON);
    expect(iconNameForCategory('')).toBe(DEFAULT_CATEGORY_ICON);
    expect(iconNameForCategory('🍽️')).toBe(DEFAULT_CATEGORY_ICON); // un emoji ya no es una clave válida
  });

  it('cubre las claves que usa el SQL de categorías iniciales', () => {
    const iniciales = [
      'salario', 'negocio', 'regalos', 'otros_ingresos', 'alimentacion', 'transporte',
      'vivienda', 'servicios', 'salud', 'educacion', 'entretenimiento', 'otros_gastos',
    ];
    for (const clave of iniciales) expect(clave in CATEGORY_ICONS).toBe(true);
  });
});
