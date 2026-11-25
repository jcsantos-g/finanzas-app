# Finanzas Personales

Aplicación móvil para administrar finanzas personales: registrar ingresos y gastos, programar movimientos recurrentes, controlar presupuestos y consultar reportes. Proyecto final de curso (equipo de 4).

**Stack:** React Native · Expo · TypeScript · Expo Router · Supabase (PostgreSQL, Auth, RLS)

## Inicio rápido

```bash
npm install
cp .env.example .env     # completar con la URL y la anon key de Supabase
npx expo start
```

Desde la terminal de Expo puedes abrir la app en un emulador de Android, un simulador de iOS o con [Expo Go](https://expo.dev/go) en tu teléfono.

La base de datos se crea ejecutando [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) en el SQL Editor de Supabase (ver [docs/database.md](docs/database.md)).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run typecheck` | Verifica tipos de TypeScript |
| `npm run lint` | Revisa el estilo del código |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run check` | Ejecuta los tres anteriores (lo mismo que la CI) |

## Estructura

```
src/app/                 Rutas (Expo Router): (auth) sin sesión · (app) con sesión
src/components/ui/       Componentes compartidos
src/lib/                 Cliente Supabase, formatos, fechas, validaciones (+ pruebas)
src/types/               Tipos de la base de datos
src/features/<módulo>/   Lógica y pantallas de cada módulo
supabase/migrations/     Esquema SQL con RLS
docs/                    Documentación del proyecto
.github/                 Plantilla de PR, CODEOWNERS y CI
```

## Documentación

| Documento | Contenido |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Reglas del equipo y reglas de negocio (también leídas por las herramientas de IA) |
| [AGENTS.md](AGENTS.md) | Reglas específicas de Expo para herramientas de IA |
| [docs/architecture.md](docs/architecture.md) | Capas, flujo de datos y decisiones técnicas |
| [docs/database.md](docs/database.md) | Modelo de datos, RLS y decisiones de diseño |
| [docs/components.md](docs/components.md) | Catálogo de componentes compartidos |
| [docs/git-workflow.md](docs/git-workflow.md) | Ramas, commits y Pull Requests |
| [docs/traceability.md](docs/traceability.md) | Requerimientos → módulo → estado |
| [docs/testing.md](docs/testing.md) | Plan de pruebas y registro de errores |
| [docs/ai-log.md](docs/ai-log.md) | Registro del uso de IA en el desarrollo |

## Equipo

| Integrante | Módulo |
|---|---|
| 1 | Arquitectura, autenticación, Dashboard y Perfil |
| 2 | Ingresos y gastos |
| 3 | Movimientos recurrentes y presupuestos |
| 4 | Reportes y pruebas |
