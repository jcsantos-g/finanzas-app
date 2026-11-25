# Catálogo de componentes compartidos

Ubicación: `src/components/ui/`. Dueño: Integrante 1.
Este archivo se actualiza en el mismo PR que agrega o cambia un componente.
Pégalo (o referéncialo) en tus prompts de IA para que reutilice estos componentes.

> Estado: **plantilla**. El Integrante 1 completa props reales al implementar cada componente.

| Componente | Para qué sirve | Props principales | Estado |
|---|---|---|---|
| `ScreenContainer` | Contenedor de pantalla (safe area, padding, scroll opcional) | `children`, `scroll?`, `title?` | Pendiente |
| `Button` | Botón de acción | `label`, `onPress`, `variant: 'primary' \| 'secondary' \| 'danger'`, `loading?`, `disabled?` | Pendiente |
| `TextField` | Campo de texto con etiqueta y error | `label`, `value`, `onChangeText`, `error?`, `secureTextEntry?` | Pendiente |
| `MoneyInput` | Campo de monto (valida > 0, formato moneda) | `label`, `value: number \| null`, `onChange`, `error?` | Pendiente |
| `DatePickerField` | Selector de fecha | `label`, `value: Date`, `onChange` | Pendiente |
| `CategoryPicker` | Selector de categoría filtrado por tipo | `type: 'income' \| 'expense'`, `value`, `onChange` | Pendiente |
| `Card` | Tarjeta base | `children`, `onPress?` | Pendiente |
| `MenuCard` | Tarjeta del Dashboard (icono + título) | `icon`, `title`, `onPress` | Pendiente |
| `ListItem` | Fila de lista (movimiento, recurrente, etc.) | `title`, `subtitle?`, `rightText?`, `onPress?` | Pendiente |
| `ProgressBar` | Barra de consumo de presupuesto | `value`, `max`, `color?` | Pendiente |
| `ConfirmModal` | Modal de confirmación (eliminar, confirmar recurrente) | `visible`, `title`, `message`, `onConfirm`, `onCancel` | Pendiente |
| `EmptyState` | Estado vacío con mensaje | `message`, `actionLabel?`, `onAction?` | Pendiente |
| `LoadingState` | Indicador de carga | `message?` | Pendiente |
| `ErrorState` | Mensaje de error con reintento | `message`, `onRetry?` | Pendiente |

## Utilidades compartidas (`src/lib/`)

| Función | Archivo | Descripción |
|---|---|---|
| `formatCurrency(amount)` | `formatters.ts` | Monto a texto con moneda |
| `formatDate(date)` | `formatters.ts` | Fecha legible en español |
| `monthRange(year, month)` | `dates.ts` | Inicio y fin de un mes |
| `addInterval(date, frequency)` | `dates.ts` | Siguiente fecha según periodicidad; aplica RN-10 (último día del mes) |
| `isPositiveAmount(n)` | `validators.ts` | Valida RN-02 (monto > 0) |

## Cómo proponer un componente nuevo

1. Confirma que no existe uno parecido en esta tabla.
2. Abre un issue o avisa en el grupo: nombre, props y quién lo necesita.
3. El Integrante 1 lo agrega a `components/ui/` y actualiza este catálogo.
4. Mientras tanto, usa un componente temporal **dentro de tu feature** marcado con `// TODO: mover a ui/`.

## Playground

Pantalla de desarrollo `src/app/(app)/dev-components.tsx` que muestra todos los componentes con datos de ejemplo. Se agrega cada componente aquí al crearlo.
