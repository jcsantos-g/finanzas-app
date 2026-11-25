# Registro de uso de IA

Objetivo del curso: evaluar la implementación de IA en el desarrollo. Cada integrante agrega una fila por cada uso relevante (no hace falta registrar consultas triviales).

**Calificación de utilidad**: 1 = inútil, 3 = útil con correcciones importantes, 5 = útil sin cambios.

| Fecha | Integrante | Herramienta | Tarea | Qué se pidió (resumen del prompt) | Utilidad (1-5) | Qué hubo que corregir | Tiempo estimado ahorrado |
|---|---|---|---|---|---|---|---|
| 2026-11-24 | 1 | Claude Code | Estructura inicial | Crear proyecto Expo + Supabase, limpiar plantilla, esquema SQL con RLS, CI, pruebas y docs | 4 | Ajustar tipos de TS 6 (`types: ["jest"]`) y probar el SQL en Supabase real | ~1 día |
| 2026-11-25 | 1 | Claude Code | Componentes compartidos | MoneyInput, DatePickerField, CategoryPicker, ConfirmModal, ListItem, ProgressBar, estados, hook de categorías, playground y guía de incorporación | _pendiente de calificar_ | El catálogo necesitó rehacerse (ver "Correcciones") | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Base de datos en español | Reescribir el SQL con nombres en español, comentarios explicativos y COMMENT ON; adaptar tipos, servicios, pruebas y docs | _pendiente de calificar_ | El SQL no pudo probarse durante la generación; lo ejecutó después el Integrante 1 | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Íconos de categorías | Reemplazar emojis por claves + @expo/vector-icons: componentes Icon/CategoryIcon, catálogo, migración 0002 y docs | _pendiente de calificar_ | _pendiente_ | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Correcciones tras primera prueba | Corregir "Unmatched Route" y hacer intuitivo el catálogo de componentes (secciones, explicaciones, ejemplos interactivos) | _pendiente de calificar_ | El catálogo inicial tenía botones sin respuesta y una carga permanente sin explicación | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Preparación del equipo y dinero disponible | Crear ramas e Issues; función SQL `dinero_disponible` y tarjeta en el Dashboard | _pendiente de calificar_ | La fusión a `main` la frenó el control de permisos de la herramienta y requirió autorización | _pendiente_ |
| 2026-11-25 | 1 | Claude Code | Cierre de la base | Actualizar documentación, publicar la versión base en `main` y verificar un clon limpio | _pendiente de calificar_ | _pendiente_ | _pendiente_ |
| 2026-11-25 | 2 | ChatGPT | Corrección de tipos de Supabase | Analizar errores de TypeScript en .insert() y .update() y proponer el cambio de cuatro declaraciones interface a type | pendiente de calificar | Se corrigió un error inicial de sintaxis al convertir las declaraciones; posteriormente npm run typecheck finalizó sin errores | pendiente |

## Lecciones aprendidas

Agrega aquí patrones que funcionaron o fallaron (prompts efectivos, errores recurrentes de la IA, cosas que no conviene delegarle).

- **Compilar no es lo mismo que funcionar.** Tipos, linter y pruebas pasaban, pero la app mostraba "Unmatched Route" al arrancar. Se encontró al probarla en el teléfono.
- **La IA conoce versiones anteriores de las herramientas.** TypeScript 6 dejó de cargar solo los tipos de Jest y hubo que declararlos. `AGENTS.md` pide consultar la documentación de la versión instalada.
- **Las decisiones de diseño son del equipo.** Los emojis como íconos y los nombres en inglés en la base se cambiaron tras revisarlos.
- **Una demostración sin explicación parece un error.** El primer catálogo tenía una carga permanente y botones sin respuesta.
- **Reglas escritas ayudan a la IA.** `CLAUDE.md` y `docs/components.md` dan el contexto para reutilizar componentes en lugar de duplicarlos.

## Reglas de uso de IA en el equipo

1. Toda sesión de IA parte de `CLAUDE.md` y `docs/components.md`.
2. Código generado por IA se **revisa y se prueba** antes del PR; quien hace el PR responde por él.
3. No pegar claves, tokens ni datos reales de usuarios en prompts.
4. Indicar en el PR si hubo uso significativo de IA.
