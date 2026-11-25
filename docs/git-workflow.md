# Flujo de trabajo con Git y GitHub

## Ramas

```
main      ← versión estable (lo que se presenta)
  └─ develop      ← integración de módulos
       ├─ feature/transactions        (Integrante 2)
       ├─ feature/recurring-budgets   (Integrante 3)
       └─ feature/reports             (Integrante 4)
```

## Configuración inicial (Integrante 1, una sola vez)

```bash
git remote add origin <URL_DEL_REPO>
git add . && git commit -m "chore: estructura inicial del proyecto"
git push -u origin main
git checkout -b develop && git push -u origin develop
```

En GitHub → Settings → Branches, crea reglas para `main` y `develop`:
*Require a pull request before merging*, *Require status checks (CI)* y *Require review from Code Owners*.

Antes de empezar, reemplaza `@INTEGRANTE1…4` en `.github/CODEOWNERS` por los usuarios reales.

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
