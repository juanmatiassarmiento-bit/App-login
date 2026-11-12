import { Asset } from 'expo-asset';
import { Image } from 'react-native';

// Fotos de los estadios descargadas de Wikimedia Commons y empaquetadas con la app.
// Tenerlas de forma local garantiza que se vean en Android, iOS y web, incluso sin internet.
export const IMAGENES_ESTADIOS = {
  monumental: require('../../assets/estadios/monumental.jpg'),
  bombonera: require('../../assets/estadios/bombonera.jpg'),
  libertadores: require('../../assets/estadios/libertadores.jpg'),
  cilindro: require('../../assets/estadios/cilindro.jpg'),
  'nuevo-gasometro': require('../../assets/estadios/nuevo-gasometro.jpg'),
  'gigante-arroyito': require('../../assets/estadios/gigante-arroyito.jpg'),
  'coloso-parque': require('../../assets/estadios/coloso-parque.jpg'),
  kempes: require('../../assets/estadios/kempes.jpg'),
  malvinas: require('../../assets/estadios/malvinas.jpg'),
  '15-abril': require('../../assets/estadios/15-abril.jpg'),
  'brigadier-lopez': require('../../assets/estadios/brigadier-lopez.jpg'),
  'estadio-unico-la-plata': require('../../assets/estadios/estadio-unico-la-plata.jpg'),
  'estadio-atletico-tucuman': require('../../assets/estadios/estadio-atletico-tucuman.jpg'),
  'estadio-estudiantes-lp': require('../../assets/estadios/estadio-estudiantes-lp.jpg'),
};

export function resolverImagen(valor) {
  if (!valor) return null;
  if (typeof valor === 'string') {
    return IMAGENES_ESTADIOS[valor] || { uri: valor };
  }
  return valor;
}

export function uriImagen(valor) {
  const fuente = resolverImagen(valor);
  if (!fuente) return '';
  if (typeof fuente === 'string') return fuente;
  if (fuente.uri) return fuente.uri;
  try {
    return Asset.fromModule(fuente).uri || '';
  } catch {
    try {
      return Image.resolveAssetSource?.(fuente)?.uri || '';
    } catch {
      return '';
    }
  }
}
