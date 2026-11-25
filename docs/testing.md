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
| T-08 | Recurrente pendiente | Programar un gasto con fecha de hoy | Aparece pendiente y NO afecta el saldo | ⬜ | |
| T-09 | Confirmar recurrente | Confirmar con otro monto | Se crea el movimiento real y avanza la fecha | ⬜ | |
| T-10 | Omitir recurrente | Omitir una ocurrencia | No se crea movimiento; avanza la fecha | ⬜ | |
| T-11 | Doble confirmación | Tocar "confirmar" dos veces seguidas | Solo existe una transacción | ⬜ | |
| T-12 | Fin de mes | Recurrente mensual el día 31 | En meses cortos cae en el último día | ⬜ | |
| T-13 | Presupuesto | Gastar sobre un presupuesto por categoría | Muestra usado, restante y excedido | ⬜ | |
| T-14 | Reportes | Cambiar de mes | Totales y gráfico corresponden al mes | ⬜ | |
| T-15 | **Aislamiento (RLS)** | Con la cuenta A crear datos; entrar con la cuenta B | B no ve nada de A | ✅ | Juan Carlos Santos / 2026-11-25 |
| T-16 | Dinero disponible | Registrar un ingreso y un gasto; volver al Dashboard | Muestra ingresos menos gastos; los recurrentes pendientes no cuentan | ⬜ | |

## Registro de errores

| # | Descripción | Módulo | Encontrado por | Estado |
|---|---|---|---|---|
| | | | | |
