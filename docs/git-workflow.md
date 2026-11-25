# Flujo de trabajo con Git y GitHub

## Ramas

```
main      ← versión estable (lo que se presenta)
  └─ develop      ← integración de módulos
       ├─ feature/transactions        (Integrante 2)
       ├─ feature/recurring-budgets   (Integrante 3)
       └─ feature/reports             (Integrante 4)
```

## Estado actual del repositorio

Repositorio: <https://github.com/jcsantos-g/finanzas-app> (público).

- Ramas `main` y `develop` creadas y **protegidas**: exigen Pull Request, 1 aprobación y que la CI (`check`) pase. No se permiten pushes forzados ni borrar las ramas.
- El dueño del repositorio puede saltarse la aprobación (necesario porque nadie puede aprobar su propio PR).
- `.github/CODEOWNERS` asigna cada carpeta a su responsable. Pendiente: usuario de GitHub del Integrante 3.
- Integrantes 2 y 4 invitados como colaboradores con permiso de escritura.
- Ramas `feature/transactions`, `feature/recurring-budgets` y `feature/reports` creadas. Antes de empezar a trabajar en una, ejecutar `git merge origin/develop`.
- Hay un Issue por requerimiento en <https://github.com/jcsantos-g/finanzas-app/issues>. Cada PR indica `Closes #<número>`. Como los PR van a `develop`, el Issue se cierra a mano o cuando el cambio llega a `main`.
- Las versiones de `develop` a `main` se fusionan con **merge commit** (no *squash*), para que las dos ramas no se separen.

Pasos para quien arranca desde cero: ver [onboarding.md](onboarding.md).

## Día a día de cada integrante

```bash
git checkout develop && git pull
git checkout -b feature/<modulo>        # solo la primera vez
git merge develop                       # traer cambios de los demás
# ... trabajar ...
npm run check                           # tipos + linter + pruebas
git add . && git commit -m "feat(transactions): formulario de gasto"
git push -u origin feature/<modulo>
# abrir Pull Request hacia develop
```

## Convención de commits

`tipo(módulo): descripción en minúscula`

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de error |
| `docs` | Solo documentación |
| `test` | Pruebas |
| `refactor` | Cambio interno sin cambiar comportamiento |
| `chore` | Configuración, dependencias |

Ejemplos: `feat(budgets): barra de consumo`, `fix(recurring): fin de mes en febrero`.

## Reglas

1. Nadie hace commit directo a `main` ni a `develop`.
2. Todo cambio entra por Pull Request con la plantilla completada.
3. El PR debe pasar la CI (`.github/workflows/ci.yml`).
4. Cambios en `src/types`, `src/lib`, `src/components/ui` o `supabase/` los revisa el Integrante 1.
5. PR pequeños: mejor varios de 1 día que uno de 1 semana.
