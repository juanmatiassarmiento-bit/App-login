# Proyecto Final - Punto Sur

App móvil hecha con React Native y Expo para iniciar sesión, explorar estadios de fútbol argentinos y agregar estadios en cualquier parte del mundo con sus coordenadas, descripción e imagen.

## Requisitos

- Node.js LTS y npm.
- Expo SDK 58, con dependencias compatibles verificadas mediante `npx expo install --check`.
- Expo Go instalado en un teléfono Android o iOS para probar la app y el mapa.
- Una clave de Google Maps será necesaria para compilar una versión independiente de Android; Expo Go ya incluye la configuración para probar.
- El proyecto Supabase indicado en `src/utils/supabase.js`, con confirmación de correo configurada según la cuenta.

## Ejecutar

```bash
npm install
npx expo start
```

Escanea el código QR que muestra Expo con la aplicación Expo Go. Para generar una versión independiente, ejecutar `npx expo prebuild` y `npx expo run:android`; en iOS, `npx expo run:ios` desde macOS.

Para abrir la versión de navegador, usar `npx expo start --web`. En la web se muestra la lista de estadios y sus detalles; el mapa interactivo con `react-native-maps` se usa en Expo Go para Android o iOS.

La URL y la clave publishable de Supabase son valores de cliente; las tablas y políticas de Supabase deben protegerse con RLS. El alta usa el correo como credencial y guarda el nombre de usuario en `user_metadata.nombre`.

## Organización

- `App.js`: puente de entrada que carga `src/App.js`.
- `src/context/AuthContext.js`: estado global, login, registro, logout y sesión Supabase.
- `src/navigation`: stack público, drawer autenticado y pestañas.
- `src/screens`: formularios, inicio y mapa.
- `src/components`: botón, campo de entrada y modal reutilizables.
- `src/utils`: cliente Supabase, validaciones y tema visual.

El mapa incluye estadios de River, Boca, Independiente, Racing, San Lorenzo, Rosario Central, Newell's, Unión y Colón, además de estadios provinciales de Córdoba y Mendoza. Cada marcador muestra club y ciudad. Al agregar un estadio, se ingresan nombre, descripción, latitud y longitud; se aceptan latitudes entre -90 y 90 y longitudes entre -180 y 180. La ubicación actual se propone como valor inicial si se concedió el permiso. Las imágenes y los estadios agregados se guardan localmente con AsyncStorage. El mapa usa `react-native-maps`, compatible con Expo Go.