# Registro de uso de IA

Objetivo del curso: evaluar la implementación de IA en el desarrollo. Cada integrante agrega una fila por cada uso relevante (no hace falta registrar consultas triviales).

**Calificación de utilidad**: 1 = inútil, 3 = útil con correcciones importantes, 5 = útil sin cambios.

| Fecha | Integrante | Herramienta | Tarea | Qué se pidió (resumen del prompt) | Utilidad (1-5) | Qué hubo que corregir | Tiempo estimado ahorrado |
|---|---|---|---|---|---|---|---|
| 2026-11-24 | 1 | Claude Code | Estructura inicial | Crear proyecto Expo + Supabase, limpiar plantilla, esquema SQL con RLS, CI, pruebas y docs | 4 | Ajustar tipos de TS 6 (`types: ["jest"]`) y probar el SQL en Supabase real | ~1 día |
| 2026-11-25 | 1 | Claude Code | Componentes compartidos | MoneyInput, DatePickerField, CategoryPicker, ConfirmModal, ListItem, ProgressBar, estados, hook de categorías, playground y guía de incorporación | _pendiente de calificar_ | _pendiente_ | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Base de datos en español | Reescribir el SQL con nombres en español, comentarios explicativos y COMMENT ON; adaptar tipos, servicios, pruebas y docs | _pendiente de calificar_ | _pendiente (probar el SQL en Supabase real)_ | _pendiente_ |

## Lecciones aprendidas

Agrega aquí patrones que funcionaron o fallaron (prompts efectivos, errores recurrentes de la IA, cosas que no conviene delegarle).

- 

## Reglas de uso de IA en el equipo

1. Toda sesión de IA parte de `CLAUDE.md` y `docs/components.md`.
2. Código generado por IA se **revisa y se prueba** antes del PR; quien hace el PR responde por él.
3. No pegar claves, tokens ni datos reales de usuarios en prompts.
4. Indicar en el PR si hubo uso significativo de IA.
