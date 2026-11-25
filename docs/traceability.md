# Trazabilidad de requerimientos

Relaciona cada requerimiento del documento con el módulo que lo implementa y su estado.
**Actualizar esta tabla en cada PR que complete un requerimiento.**

Estados: ⬜ pendiente · 🟨 en progreso · ✅ terminado

| Requerimiento | Descripción | Responsable | Ubicación | Estado |
|---|---|---|---|---|
| RF-01 | Autenticación (registro, login, logout, recuperar contraseña) | Integrante 1 | `src/features/auth`, `src/app/(auth)` | 🟨 pantallas base; falta pantalla para definir nueva contraseña |
| RF-02 | Gestión de ingresos | Integrante 2 | `src/features/transactions` | ⬜ |
| RF-03 | Gestión de gastos | Integrante 2 | `src/features/transactions` | ⬜ |
| RF-04 | Dashboard (menú de tarjetas + dinero disponible; decisión del equipo) | Integrante 1 | `src/features/dashboard` | ✅ |
| — | Componentes compartidos y categorías (base para RF-02/03/05/07) | Integrante 1 | `src/components/ui`, `src/features/categories` | ✅ (ver `docs/components.md`) |
| RF-05 | Movimientos recurrentes | Integrante 3 | `src/features/recurring` | ⬜ |
| RF-06 | Dinero disponible | Integrante 1 | `src/features/balance`, `0003_dinero_disponible.sql` | 🟨 implementado; falta probar con movimientos reales |
| RF-07 | Presupuestos | Integrante 3 | `src/features/budgets` | ⬜ |
| RF-08 | Reportes básicos | Integrante 4 | `src/features/reports` | ⬜ |
| RF-09 | Escaneo de tickets con IA (adicional) | Equipo | por definir | ⬜ |

| Regla | Cómo se garantiza | Estado |
|---|---|---|
| RN-01 / RN-14 Aislamiento por usuario | RLS en `supabase/migrations/0001_init.sql` | ✅ probado con 2 cuentas (T-15) |
| RN-02 Monto > 0 | `validators.ts` + `check` SQL | ✅ |
| RN-03 Estructura única de movimientos | Tabla `movimientos` con `tipo` | ✅ |
| RN-05 / RN-11 Pendientes no afectan cálculos | Cálculos solo sobre `movimientos` | ⬜ al implementar |
| RN-09 / RN-10 Siguiente fecha | `lib/dates.ts` + pruebas | ✅ |
| Anti-duplicados de recurrentes | Índice único SQL | ✅ |

## Criterios de finalización del MVP (sección 13 del documento)

- [x] Registrarse e iniciar sesión
- [ ] Registrar, editar, consultar y eliminar ingresos y gastos
- [ ] Dinero disponible correcto
- [ ] Programar, confirmar y omitir recurrentes
- [ ] Pendientes no afectan cálculos
- [ ] Presupuestos y su consumo
- [ ] Reportes por mes
- [x] Datos aislados entre usuarios (categorías; repetir cuando haya movimientos, presupuestos y recurrentes)
- [ ] Funciona en un dispositivo móvil
