# Guía de incorporación (empieza aquí)

Pasos para dejar tu computadora lista y abrir tu primer Pull Request. Tiempo estimado: 30 minutos.

## 1. Requisitos

- [Node.js](https://nodejs.org) 22 o superior (`node -v`)
- [Git](https://git-scm.com) y una cuenta de GitHub aceptada como colaboradora del repositorio
- [Visual Studio Code](https://code.visualstudio.com) (recomendado)
- La app **Expo Go** en tu teléfono (Android o iOS), o un emulador

## 2. Clonar e instalar

```bash
git clone https://github.com/jcsantos-g/finanzas-app.git
cd finanzas-app
git checkout develop
npm install
```

> Si trabajas en Windows, clónalo fuera de OneDrive (por ejemplo `C:\dev`): `node_modules` tiene miles de archivos y OneDrive los bloquea.

## 3. Variables de entorno

1. Copia `.env.example` a `.env`.
2. Pide al Integrante 1 la URL y la *anon key* de Supabase **por un canal privado** (nunca por el repositorio ni en capturas públicas).
3. Pégalas en `.env`. Ese archivo está ignorado por Git: no se sube.

## 4. Ejecutar la app

```bash
npx expo start
```

Escanea el código QR con Expo Go. Desde Perfil → "Ver catálogo de componentes" puedes ver todos los componentes disponibles.

Antes de cualquier cambio, comprueba que todo está bien:

```bash
npm run check     # tipos + linter + pruebas
```

## 5. Tu rama y tu carpeta

| Integrante | Rama | Tu carpeta |
|---|---|---|
| 2 | `feature/transactions` | `src/features/transactions/` y `src/app/(app)/{income,expenses,transaction-form}.tsx` |
| 3 | `feature/recurring-budgets` | `src/features/recurring/`, `src/features/budgets/` y sus rutas |
| 4 | `feature/reports` | `src/features/reports/` y su ruta |

```bash
git checkout develop && git pull
git checkout feature/<tu-modulo>
git merge origin/develop     # traer lo último antes de empezar
```

Tus tareas están en los [Issues](https://github.com/jcsantos-g/finanzas-app/issues) del repositorio.

**Solo toca tu carpeta.** Si necesitas cambiar algo de `src/components/ui`, `src/lib`, `src/types` o `supabase/`, avisa al Integrante 1.

## 6. Cómo trabajar con IA en este proyecto

1. Empieza cada sesión indicando a la herramienta que lea `CLAUDE.md`, `AGENTS.md` y `docs/components.md`.
2. Dile **qué módulo es el tuyo** y qué requerimiento vas a implementar (consulta `docs/traceability.md`).
3. Revisa y prueba lo que genere. Tú respondes por el código de tu PR.
4. Si te propone un botón, campo o tarjeta nueva, recházalo: ya existe en `components/ui`.
5. Anota el uso relevante en `docs/ai-log.md`.

Prompt de arranque sugerido:

> Lee CLAUDE.md, AGENTS.md y docs/components.md. Soy el Integrante 2 y trabajo en `src/features/transactions`. Voy a implementar el requerimiento RF-03 (gastos). Usa solo los componentes de `components/ui` y el patrón de `service.ts`.

## 7. Tu primer Pull Request

```bash
git add .
git commit -m "feat(transactions): lista de gastos"
git push -u origin feature/<tu-modulo>
```

1. En GitHub, abre un Pull Request hacia **`develop`** (nunca hacia `main`).
2. Completa la plantilla del PR.
3. Espera a que la CI (`check`) esté en verde y a la revisión del Integrante 1.

Más detalle en [git-workflow.md](git-workflow.md).

## 8. ¿Dudas?

- Arquitectura y capas: [architecture.md](architecture.md)
- Tablas y reglas de datos: [database.md](database.md)
- Reglas de negocio: [CLAUDE.md](../CLAUDE.md)
- Qué prueba cada quien: [testing.md](testing.md)
