# Catálogo de componentes compartidos

Ubicación: `src/components/ui/` (se importan desde `@/components/ui`). Dueño: Integrante 1.
Este archivo se actualiza en el mismo PR que agrega o cambia un componente.
**Pégalo (o referéncialo) en tus prompts de IA** para que reutilice estos componentes en vez de inventar otros.

Para verlos funcionando: abre la app en modo desarrollo → Perfil → "Ver catálogo de componentes" (`src/app/(app)/dev-components.tsx`).

## Componentes

| Componente | Para qué sirve | Props principales |
|---|---|---|
| `ScreenContainer` | Contenedor de pantalla (área segura, fondo del tema, padding) | `scroll?` |
| `Button` | Botón de acción | `label`, `onPress`, `variant?: 'primary' \| 'secondary' \| 'danger'`, `loading?`, `disabled?` |
| `TextField` | Campo de texto con etiqueta y error | `label`, `value`, `onChangeText`, `error?` + props de `TextInput` |
| `MoneyInput` | Campo de monto; entrega `number \| null` | `label?`, `value: number \| null`, `onChange`, `error?` |
| `DatePickerField` | Fecha con flechas ‹ › y atajos Hoy / Ayer | `label?`, `value: 'YYYY-MM-DD'`, `onChange` |
| `CategoryPicker` | Selección de categoría en etiquetas (presentacional) | `categories`, `value: string \| null`, `onChange(id)`, `label?`, `error?` |
| `Icon` | Ícono vectorial genérico (menús, botones) | `name: IconName`, `size?`, `color?` |
| `CategoryIcon` | Ícono de una categoría a partir de la clave guardada en la base | `clave: string | null`, `size?`, `color?` |
| `Card` | Tarjeta base; si recibe `onPress` es pulsable | `onPress?`, `children` |
| `ListItem` | Fila de lista (movimiento, recurrente, presupuesto) | `title`, `subtitle?`, `rightText?`, `rightColor?`, `onPress?` |
| `ProgressBar` | Barra de consumo (verde → ámbar al 80 % → rojo al pasar el límite) | `value`, `max`, `color?` |
| `ConfirmModal` | Diálogo de confirmación | `visible`, `title`, `message?`, `confirmLabel?`, `destructive?`, `loading?`, `onConfirm`, `onCancel` |
| `EmptyState` | Estado vacío con acción opcional | `message`, `actionLabel?`, `onAction?` |
| `LoadingState` | Indicador de carga | `message?` |
| `ErrorState` | Error con botón "Reintentar" | `message`, `onRetry?` |
| `PlaceholderScreen` | Pantalla temporal (se reemplaza al implementar el módulo) | `title`, `owner` |

### Ejemplo: formulario de gasto armado solo con componentes compartidos

```tsx
const { categories } = useCategories('gasto'); // features/categories

<MoneyInput value={amount} onChange={setAmount} error={error} />
<DatePickerField value={date} onChange={setDate} />
<CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
<Button label="Guardar" onPress={onSave} loading={saving} disabled={!isPositiveAmount(amount) || !categoryId} />
```

### Decisiones de diseño

- `DatePickerField` no usa un selector nativo a propósito: no agrega dependencias, funciona igual en Android e iOS y registrar "hoy" o "ayer" toma un toque. Si el equipo prefiere un calendario, se puede reemplazar sin cambiar su interfaz (`value` / `onChange`).
- `CategoryPicker` **no consulta datos**: recibe la lista por props. Los datos los entrega el hook `useCategories(type)`. Así el componente es reutilizable y las pantallas no llaman a Supabase directamente.
- **Íconos:** la base guarda una **clave** (`categorias.icono = 'alimentacion'`), nunca un emoji. `CategoryIcon` la traduce a un ícono vectorial de `MaterialCommunityIcons` (`@expo/vector-icons`) usando el catálogo `CATEGORY_ICONS` de `src/components/ui/iconCatalog.ts`. Si la clave es nula o desconocida se muestra un ícono genérico. Para agregar un ícono, se añade una línea a ese catálogo (y a la tabla de abajo). Explorar íconos disponibles: <https://pictogrammers.com/library/mdi/>.
- Los colores de acento (`primary`, `danger`, `success`, `warning`) están en `Palette` (`src/constants/theme.ts`).

## Claves de íconos de categorías

| Ingresos | Gastos |
|---|---|
| `salario`, `negocio`, `regalos`, `otros_ingresos`, `inversion` | `alimentacion`, `transporte`, `vivienda`, `servicios`, `salud`, `educacion`, `entretenimiento`, `compras`, `viajes`, `mascotas`, `ahorro`, `tarjeta`, `otros_gastos` |

Se pueden ver todas en el catálogo de la app (Perfil → "Ver catálogo de componentes").

## Utilidades compartidas (`src/lib/`)

| Función | Archivo | Descripción |
|---|---|---|
| `formatCurrency(amount)` | `formatters.ts` | Monto a texto con moneda |
| `formatDate(isoDate)` | `formatters.ts` | `"2026-03-15"` → `"15 mar 2026"` |
| `todayIso()` / `toIsoDate(date)` | `dates.ts` | Fecha de hoy / conversión a `YYYY-MM-DD` |
| `addDays(isoDate, n)` | `dates.ts` | Suma o resta días |
| `monthRange(year, month)` | `dates.ts` | Primer y último día de un mes |
| `addInterval(isoDate, frequency, anchorDay?)` | `dates.ts` | Siguiente fecha recurrente; aplica RN-09 y RN-10 |
| `isPositiveAmount(n)` | `validators.ts` | Valida RN-02 (monto > 0) |
| `parseAmount(text)` | `validators.ts` | `"1,250.50"` → `1250.5` o `null` |
| `isValidEmail(text)` | `validators.ts` | Formato básico de correo |

## Datos compartidos (`src/features/categories/`)

| Elemento | Descripción |
|---|---|
| `listCategories(tipo)` | Categorías del usuario por tipo (`ingreso` / `gasto`) |
| `useCategories(tipo)` | Hook: `{ categories, loading, error, reload }` |

## Cómo proponer un componente nuevo

1. Confirma que no existe uno parecido en esta tabla.
2. Avisa en el grupo o abre un issue: nombre, props y quién lo necesita.
3. El Integrante 1 lo agrega a `components/ui/`, lo suma al playground y actualiza este catálogo.
4. Mientras tanto, usa un componente temporal **dentro de tu feature** marcado con `// TODO: mover a ui/`.
