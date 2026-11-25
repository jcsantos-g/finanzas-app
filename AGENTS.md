Esta es una aplicación móvil Expo/React Native. Prioriza patrones pensados para móvil, rendimiento y compatibilidad multiplataforma.

## Expo cambia: no confíes en lo que recuerdas

Expo publica cambios incompatibles en cada versión del SDK. Las APIs que recuerdas pueden haber cambiado de nombre, de lugar o haber sido eliminadas. Antes de escribir código que toque una API de Expo, EAS o React Native:

1. Lee la versión mayor del paquete `expo` en `package.json`.
2. Consulta la documentación de esa versión: `https://docs.expo.dev/versions/v<major>.0.0/`
3. Para cualquier otra cosa, consulta https://docs.expo.dev/llms.txt, un índice de toda la documentación de Expo con correcciones a errores comunes de los modelos de IA. Sigue sus enlaces hasta la página que necesites; nunca respondas de memoria.

## Comandos

Usa `bunx` en lugar de `npx` si el proyecto usa bun (si existe `bun.lock`).

```bash
npx expo install <paquete>  # SIEMPRE en lugar de npm/yarn/pnpm/bun add: resuelve versiones compatibles con el SDK
npx expo start              # inicia el servidor de desarrollo
npx expo lint               # linter
npx tsc --noEmit            # verificación de tipos
npx expo-doctor             # diagnostica problemas de dependencias y configuración
npx expo install --fix      # corrige versiones incompatibles de paquetes
```

Ejecuta el linter y la verificación de tipos antes de dar una tarea por terminada.

## Navegación y rutas

- Usa **Expo Router** para toda la navegación. Las rutas viven en `src/app/`: cada archivo es una pantalla y los `_layout.tsx` definen los navegadores. Mantén el código que no es de rutas (componentes, hooks, utilidades) fuera de `src/app/`.
- Importa `Link`, `router` y `useLocalSearchParams` desde `expo-router`.
- Documentación: https://docs.expo.dev/router/introduction.md

## Compilación con EAS

Usa EAS para compilar, firmar y publicar la app en la nube (`eas build`, `eas submit`) y para enviar actualizaciones por aire (`eas update`), sin necesitar Xcode ni Android Studio local. Ejecuta EAS CLI como `bunx eas-cli <comando>` en proyectos con Bun, o `npx eas-cli@latest <comando>` en los demás; sustitúyelo por `eas` a secas en los ejemplos de la documentación.
Documentación: https://docs.expo.dev/eas/index.md

## Reglas

- Si no existen las carpetas `ios/` y `android/`, se generan automáticamente (Continuous Native Generation). Nunca las crees ni edites a mano: configura el comportamiento nativo en `app.json` y con config plugins.
- Expo Go solo incluye sus módulos nativos integrados. Después de agregar una librería con código nativo, la app necesita un development build: `npx expo run:ios|android` en local, o `eas build --profile development`.
- Prefiere los módulos recomendados de Expo sobre librerías de terceros, y revisa tus skills disponibles antes de agregar dependencias. Documentación: https://docs.expo.dev/versions/latest/index.html
