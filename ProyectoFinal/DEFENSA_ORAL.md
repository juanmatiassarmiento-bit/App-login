# Guía para la defensa oral (4 a 5 minutos)

## Presentación

Hola, mi proyecto se llama Punto Sur. Es una aplicación móvil para iniciar sesión y explorar estadios de fútbol. El mapa incluye canchas de distintos clubes y provincias de Argentina, y también permite agregar estadios de cualquier parte del mundo usando sus coordenadas, una descripción y, si se quiere, una foto.

## Registro y login

Para usar las funciones privadas primero hay que iniciar sesión. Si todavía no hay una cuenta, desde la pantalla de ingreso se puede abrir el registro. Ahí se pide un nombre de usuario, un correo, una contraseña y su confirmación. Antes de llamar a Supabase, el programa revisa que los campos estén completos, que el nombre tenga al menos tres caracteres, que el correo tenga un formato válido y que la contraseña tenga seis caracteres como mínimo. También comprueba que las dos contraseñas coincidan.

En el login se envían el correo y la contraseña a Supabase. Si hay un error, se muestra un mensaje en español para que sea fácil saber qué pasó. Cuando Supabase requiere confirmar el correo, la aplicación también informa ese paso.

## Contexto y sesión

`AuthContext` es el lugar donde se comparte el estado de autenticación con toda la aplicación. Ahí están las operaciones de registro, ingreso y cierre de sesión. Las pantallas no necesitan crear su propia conexión con Supabase: usan el contexto y reciben el usuario y las funciones que necesitan.

La sesión se guarda usando AsyncStorage como almacenamiento de Supabase. Al abrir la app, AuthContext consulta la sesión existente y escucha los cambios de autenticación. Por eso, si el usuario ya estaba conectado, vuelve directamente a la parte privada. Al cerrar sesión, Supabase elimina la sesión y la app vuelve a las pantallas públicas.

## Navegación

`AppNavigator` toma la decisión principal. Sin usuario muestra un Stack Navigator con ingreso y registro. Con usuario muestra un Drawer Navigator, que contiene un Bottom Tab Navigator con dos pestañas: Inicio y Mapa. Así, el menú lateral y el mapa quedan disponibles solo después de iniciar sesión.

## Mapa y lugares

La pantalla Mapa usa `react-native-maps`, que permite probar el mapa directamente con Expo Go en Android o iOS. `expo-location` solicita permiso mientras la app está en uso y muestra la ubicación actual cuando se concede. El mapa abre con una vista general de Argentina. En el navegador se muestra una lista de estadios porque el componente del mapa es nativo.

Hay marcadores iniciales de estadios de Buenos Aires, Rosario, Santa Fe, Córdoba y Mendoza. Al tocar uno se abre un modal con el club, la ciudad y una descripción. El botón de agregar abre el mismo componente modal en modo formulario: pide nombre, descripción, latitud y longitud, así se puede marcar un estadio en cualquier lugar del mundo. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180. También permite elegir una foto. Al guardar, el mapa se centra en esas coordenadas y el nuevo marcador aparece en la lista. Los datos se conservan localmente con AsyncStorage.

## Organización y cierre

Separé el código por responsabilidad: `screens` contiene las pantallas, `components` los elementos reutilizables, `navigation` la navegación, `context` la sesión y `utils` las validaciones, el tema y el cliente de Supabase. `CustomButton`, `InputField` y `Modal` se pueden reutilizar en distintas partes.

En resumen, Punto Sur combina autenticación real con Supabase, navegación protegida y un mapa de estadios ampliable con coordenadas globales. Para la entrega, lo importante es probarlo en un teléfono o development build con los permisos y la clave de mapas configurados.