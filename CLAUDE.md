# CLAUDE.md — Reglas del proyecto (léelo antes de generar código)

> Además de este archivo, lee `AGENTS.md` (reglas específicas de Expo: usar `npx expo install`, consultar docs versionadas, etc.).

App móvil de finanzas personales. React Native + Expo + TypeScript + Expo Router + Supabase (PostgreSQL, Auth, RLS).
Proyecto final de curso, equipo de 4. Prioridad: **app funcional y estable**, no funcionalidades extra.

## Estructura de carpetas

```
src/app/                # Rutas de Expo Router (pantallas delgadas, sin lógica); grupos (auth) y (app)
src/
  components/ui/        # Componentes compartidos (dueño: Integrante 1)
  lib/                  # supabase.ts, formatters.ts, dates.ts, validators.ts (dueño: Integrante 1)
  types/                # Tipos compartidos y de base de datos (dueño: Integrante 1)
  features/
    auth/               # Integrante 1
    dashboard/          # Integrante 1
    transactions/       # Integrante 2
    recurring/          # Integrante 3
    budgets/            # Integrante 3
    reports/            # Integrante 4
  # Cada feature: components/, hooks/, service.ts, types.ts (solo si es local)
docs/                   # Documentación (arquitectura, base de datos, pruebas, trazabilidad)
supabase/migrations/    # Esquema SQL (dueño: Integrante 1)
```

## Reglas obligatorias

1. **Reutiliza antes de crear.** Antes de escribir un botón, input, tarjeta, selector, modal o estado vacío, revisa `docs/components.md` y `src/components/ui/`. Nunca crees un duplicado dentro de una feature.
2. Si hace falta un componente genérico que no existe, **no lo crees en tu feature**: propónlo al Integrante 1 (PR pequeño a `src/components/ui/`).
3. **No modifiques** `src/types/`, `src/lib/`, `src/components/ui/` ni las tablas/RLS sin coordinar con el Integrante 1.
4. **Acceso a datos solo en `features/<x>/service.ts`** usando el cliente de `src/lib/supabase.ts`. Las pantallas y componentes nunca llaman a Supabase directamente.
5. **TypeScript estricto**: sin `any`, sin `@ts-ignore`. Usa los tipos de `src/types/`.
6. **Formato siempre vía utilidades**: montos con `formatCurrency`, fechas con `formatDate`. No formatees a mano.
7. **Nunca** pongas claves o secretos en el código. Variables `EXPO_PUBLIC_*` solo para la URL y la anon key de Supabase. Las credenciales de IA van solo en Edge Functions.
8. No agregues dependencias nuevas sin avisar al equipo.
9. Textos de interfaz en español.
10. No dejes `console.log` ni código comentado en los PR.

## Modelo de datos (resumen)

Tablas: `categories`, `transactions`, `recurring_schedules`, `budgets`. Todas con `user_id` y RLS.
- `transactions.type`: `income` | `expense`. `source`: `manual` | `recurring` | `ai`.
- `recurring_schedules.frequency`: `weekly` | `biweekly` | `monthly`.
- `budgets.category_id` es `NULL` para el presupuesto general. Un presupuesto general y uno por categoría por mes.
- Totales, saldo y porcentajes **se calculan**, no se guardan.

## Reglas de negocio que el código debe respetar

- **RN-02**: todo monto > 0 (validar en formulario y con `CHECK` en base de datos).
- **Dinero disponible** = ingresos reales − gastos reales. Solo tabla `transactions`.
- **RN-05/RN-11**: los recurrentes pendientes NO afectan saldo, presupuestos ni reportes.
- **RN-06**: confirmar un recurrente crea una `transaction` (`source = 'recurring'`, con `recurring_schedule_id` y `scheduled_date`) y avanza `next_due_date`.
- **RN-07**: omitir no crea transacción, solo avanza `next_due_date`.
- **RN-08**: los vencidos siguen pendientes hasta que el usuario actúe.
- **RN-09**: la siguiente fecha se calcula desde la fecha programada anterior, no desde hoy.
- **RN-10**: si el día no existe en el mes (ej. 31), usar el último día de ese mes. Usar `addInterval` de `src/lib/dates.ts`; no reimplementar.
- **Anti-duplicados**: confirmar la misma ocurrencia dos veces no debe crear dos transacciones (restricción única sobre `recurring_schedule_id` + `scheduled_date`).
- **RN-12**: presupuestos consideran solo gastos reales del mes.
- **RN-13**: nada extraído por IA se guarda sin confirmación del usuario. La foto del ticket nunca se almacena.
- **RN-14**: aislamiento por usuario garantizado por RLS, no solo por filtros en el cliente.

## Git

- Ramas: `main` (estable) ← `develop` (integración) ← `feature/<modulo>`.
- Nadie hace commits directos a `main` ni `develop`. Todo por Pull Request.
- Commits en español o inglés, pero descriptivos y en un solo estilo: `feat(transactions): formulario de gasto`.
- PR pequeños y con la plantilla de `.github/pull_request_template.md`.

## Antes de dar por terminado un cambio

- [ ] `npm run check` sin errores (tipos + linter + pruebas)
- [ ] Probado en dispositivo o emulador
- [ ] Usa componentes de `components/ui`
- [ ] Registrado en `docs/ai-log.md` si se usó IA
