# Plan de pruebas

Responsable: Integrante 4 (con apoyo de todos). Se llena durante el desarrollo, no al final.

## Pruebas automáticas

```bash
npm test          # pruebas unitarias (Jest)
npm run check     # tipos + linter + pruebas
```

Hoy cubren `src/lib/dates.ts` (fechas recurrentes, fin de mes, años bisiestos) y `src/lib/validators.ts`.
Regla: toda función nueva de cálculo en `lib/` o en un servicio debe llevar su prueba en `__tests__/`.

## Pruebas funcionales manuales

Ejecutar en un dispositivo real o emulador. Marcar con la fecha y el nombre de quien probó.

| ID | Caso | Pasos | Resultado esperado | Estado | Quién / cuándo |
|---|---|---|---|---|---|
| T-01 | Registro | Crear cuenta con correo y contraseña válidos | Se crea la cuenta y entra a la app | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-02 | Login incorrecto | Contraseña errónea | Mensaje de error, no entra | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-03 | Cerrar sesión | Perfil → Cerrar sesión | Vuelve al login | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-04 | Ruta protegida | Sin sesión intentar abrir la app | Solo se ven pantallas de autenticación | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-05 | Monto inválido | Registrar gasto con monto 0 o negativo | Se rechaza con mensaje | ⬜ | |
| T-06 | Crear gasto | Registrar gasto válido | Aparece en la lista y baja el dinero disponible | ⬜ | |
| T-07 | Editar / eliminar | Modificar y borrar un movimiento | Los totales se actualizan | ⬜ | |
| T-08 | Recurrente pendiente | Programar un gasto con fecha de hoy | Aparece pendiente y NO afecta el saldo | 🟨 pasa en web; falta teléfono | Claude Code / 2026-11-25; «Usuario» (sin identificar) / 2026-11-26 |
| T-09 | Confirmar recurrente | Confirmar con otro monto | Se crea el movimiento real y avanza la fecha | 🟨 pasa en web; falta teléfono | Claude Code / 2026-11-25; «Usuario» (sin identificar) / 2026-11-26 |
| T-10 | Omitir recurrente | Omitir una ocurrencia | No se crea movimiento; avanza la fecha | 🟨 pasa en web; falta teléfono | Claude Code / 2026-11-25; «Usuario» (sin identificar) / 2026-11-26 |
| T-11 | Doble confirmación | Tocar "confirmar" dos veces seguidas | Solo existe una transacción | 🟨 pasa en web; falta teléfono | Claude Code / 2026-11-25; «Usuario» (sin identificar) / 2026-11-26 |
| T-12 | Fin de mes | Recurrente mensual el día 31 | En meses cortos cae en el último día | 🟨 pasa en web; falta teléfono | Claude Code / 2026-11-25; «Usuario» (sin identificar) / 2026-11-26 |
| T-13 | Presupuesto | Gastar sobre un presupuesto por categoría | Muestra usado, restante y excedido | ⬜ | |
| T-14 | Reportes | Cambiar de mes | Totales y gráfico corresponden al mes | ⬜ | |
| T-15 | **Aislamiento (RLS)** | Con la cuenta A crear datos; entrar con la cuenta B | B no ve nada de A | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-16 | Dinero disponible | Registrar un ingreso y un gasto; volver al Dashboard | Muestra ingresos menos gastos; los recurrentes pendientes no cuentan | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-17 | Ingreso recurrente | Programar y confirmar un ingreso recurrente vencido | Se crea un ingreso real y aumenta el dinero disponible | 🟨 pasa en web; falta teléfono | «Usuario» (sin identificar) / 2026-11-26 |

### Movimientos recurrentes

El 2026-11-25 se probó la **versión web** contra Supabase, con `0004_resolver_movimiento_recurrente.sql` aplicada:

- T-08, T-09 y T-11 con un gasto y con un ingreso. En T-11 se hizo doble clic en "Guardar" y el saldo cambió una sola vez.
- T-10 omitiendo un gasto y un ingreso.
- T-12 omitiendo un ingreso mensual del 31 oct, que pasó al 30 nov. El regreso posterior al día 31 solo lo cubren las pruebas unitarias de `addInterval`.
- Además: editar el monto, pausar, reanudar, eliminar sin confirmaciones y el bloqueo al eliminar con confirmaciones.

Un commit de `dlh-lpi` registra que «Usuario» repitió en web T-08 a T-12 y probó T-17 el 2026-11-26. Falta confirmar quién ejecutó esas pruebas.

**Falta repetirlo en un teléfono o emulador** antes de marcar los casos como terminados.

## Registro de errores

| # | Descripción | Módulo | Encontrado por | Estado |
|---|---|---|---|---|
| | | | | |
