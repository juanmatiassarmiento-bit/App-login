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

Para abrir la versión de navegador, usar `npx expo start --web`. La web incluye un mapa interactivo (Leaflet + OpenStreetMap), la misma colección de estadios con sus fotos, el buscador y el asistente Suri. En Android e iOS el mapa se renderiza con `react-native-maps`.

La URL y la clave publishable de Supabase son valores de cliente; las tablas y políticas de Supabase deben protegerse con RLS. El alta usa el correo como credencial y guarda el nombre de usuario en `user_metadata.nombre`.

## Organización

- `App.js`: puente de entrada que carga `src/App.js`.
- `src/context/AuthContext.js`: estado global, login, registro, logout y sesión Supabase.
- `src/navigation`: stack público, drawer autenticado y pestañas.
- `src/screens`: formularios, inicio y mapa.
- `src/components`: botón, campo de entrada y modal reutilizables.
- `src/utils`: cliente Supabase, validaciones y tema visual.

El mapa incluye estadios de River, Boca, Independiente, Racing, San Lorenzo, Rosario Central, Newell's, Unión y Colón, además de estadios provinciales de Córdoba, Mendoza, Tucumán y La Plata. Cada marcador muestra la foto del estadio y abre una ficha con club, ciudad y coordenadas. Las fotos del catálogo viajan empaquetadas en `assets/estadios` (descargadas de Wikimedia Commons), así se ven en Android, iOS y web sin depender de internet. Al agregar un estadio, se ingresan nombre, descripción, latitud y longitud; se aceptan latitudes entre -90 y 90 y longitudes entre -180 y 180. La ubicación actual se propone como valor inicial si se concedió el permiso. Los estadios agregados y sus fotos se guardan localmente con AsyncStorage.