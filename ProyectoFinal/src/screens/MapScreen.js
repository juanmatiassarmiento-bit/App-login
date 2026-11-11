import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import StadiumMap from '../components/StadiumMap';
import tema from '../utils/tema';

const STORAGE_KEY = '@punto-sur/estadios';
const CENTRO_ARGENTINA = { latitude: -33.1, longitude: -63.7 };
const BUENOS_AIRES = { latitude: -34.6037, longitude: -58.3816 };
const ESTADIOS_INICIALES = [
  { id: 'monumental', title: 'Mâs Monumental', club: 'River Plate', city: 'Núñez, Buenos Aires', description: 'La casa de River Plate, en el barrio de Núñez.', latitude: -34.5453, longitude: -58.4498, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Estadio_Monumental_Antonio_Vespucio_Liberti.jpg/640px-Estadio_Monumental_Antonio_Vespucio_Liberti.jpg' },
  { id: 'bombonera', title: 'La Bombonera', club: 'Boca Juniors', city: 'La Boca, Buenos Aires', description: 'El estadio de Boca Juniors, en el barrio de La Boca.', latitude: -34.6357, longitude: -58.3647, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Estadio_Alberto_J._Armando.jpg/640px-Estadio_Alberto_J._Armando.jpg' },
  { id: 'libertadores', title: 'Libertadores de América', club: 'Independiente', city: 'Avellaneda, Buenos Aires', description: 'El estadio de Independiente, en Avellaneda.', latitude: -34.6705, longitude: -58.3718, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Libertadores_de_America_Independiente.jpg/640px-Libertadores_de_America_Independiente.jpg' },
  { id: 'cilindro', title: 'El Cilindro', club: 'Racing Club', city: 'Avellaneda, Buenos Aires', description: 'El estadio Presidente Perón, casa de Racing Club.', latitude: -34.6671, longitude: -58.3683, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Estadio_Presidente_Per%C3%B3n.jpg/640px-Estadio_Presidente_Per%C3%B3n.jpg' },
  { id: 'nuevo-gasometro', title: 'Nuevo Gasómetro', club: 'San Lorenzo', city: 'Bajo Flores, Buenos Aires', description: 'El estadio Pedro Bidegain, donde juega San Lorenzo.', latitude: -34.6526, longitude: -58.4402, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Estadio_Pedro_Bidegain.jpg/640px-Estadio_Pedro_Bidegain.jpg' },
  { id: 'gigante-arroyito', title: 'Gigante de Arroyito', club: 'Rosario Central', city: 'Rosario, Santa Fe', description: 'El estadio de Rosario Central, junto al río Paraná.', latitude: -32.9159, longitude: -60.6745, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Estadio_Gigante_de_Arroyito.jpg/640px-Estadio_Gigante_de_Arroyito.jpg' },
  { id: 'coloso-parque', title: 'Coloso del Parque', club: "Newell's Old Boys", city: 'Rosario, Santa Fe', description: 'El estadio Marcelo Bielsa, casa de Newell’s Old Boys.', latitude: -32.9584, longitude: -60.6611, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Estadio_Marcelo_Bielsa.JPG/640px-Estadio_Marcelo_Bielsa.JPG' },
  { id: 'kempes', title: 'Mario Alberto Kempes', club: 'Estadio provincial', city: 'Córdoba, Córdoba', description: 'Uno de los principales estadios de la provincia de Córdoba.', latitude: -31.3699, longitude: -64.2467, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Estadio_Mario_Alberto_Kempes.jpg/640px-Estadio_Mario_Alberto_Kempes.jpg' },
  { id: 'malvinas', title: 'Malvinas Argentinas', club: 'Estadio provincial', city: 'Mendoza, Mendoza', description: 'Estadio mendocino ubicado en el Parque General San Martín.', latitude: -32.8893, longitude: -68.8785, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Estadio_Malvinas_Argentinas.jpg/640px-Estadio_Malvinas_Argentinas.jpg' },
  { id: '15-abril', title: '15 de Abril', club: 'Unión de Santa Fe', city: 'Santa Fe, Santa Fe', description: 'La cancha de Unión, en la ciudad de Santa Fe.', latitude: -31.6278, longitude: -60.7169, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Estadio_15_de_Abril.jpg/640px-Estadio_15_de_Abril.jpg' },
  { id: 'brigadier-lopez', title: 'Brigadier López', club: 'Colón de Santa Fe', city: 'Santa Fe, Santa Fe', description: 'El estadio de Colón, conocido como el Cementerio de los Elefantes.', latitude: -31.6354, longitude: -60.7061, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Estadio_Brigadier_General_Estanislao_L%C3%B3pez.jpg/640px-Estadio_Brigadier_General_Estanislao_L%C3%B3pez.jpg' },
  { id: 'estadio-unico-la-plata', title: 'Estadio Único Diego Armando Maradona', club: 'Estadio provincial', city: 'La Plata, Buenos Aires', description: 'Estadio moderno de la ciudad de La Plata.', latitude: -34.9038, longitude: -57.9868, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Estadio_Ciudad_de_La_Plata.jpg/640px-Estadio_Ciudad_de_La_Plata.jpg' },
  { id: 'estadio-atletico-tucuman', title: 'Monumental José Fierro', club: 'Atlético Tucumán', city: 'San Miguel de Tucumán, Tucumán', description: 'El estadio de Atlético Tucumán.', latitude: -26.8115, longitude: -65.2015, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Estadio_Monumental_Jos%C3%A9_Fierro.jpg/640px-Estadio_Monumental_Jos%C3%A9_Fierro.jpg' },
  { id: 'estadio-talleres-cordoba', title: 'Mario Kempes (Talleres)', club: 'Talleres de Córdoba', city: 'Córdoba, Córdoba', description: 'Estadio donde juega Talleres de Córdoba.', latitude: -31.3699, longitude: -64.2467, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Estadio_Mario_Alberto_Kempes.jpg/640px-Estadio_Mario_Alberto_Kempes.jpg' },
  { id: 'estadio-estudiantes-lp', title: 'Jorge Luis Hirschi', club: 'Estudiantes de La Plata', city: 'La Plata, Buenos Aires', description: 'El moderno estadio de Estudiantes de La Plata.', latitude: -34.9123, longitude: -57.9405, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Estadio_Jorge_Luis_Hirschi.jpg/640px-Estadio_Jorge_Luis_Hirschi.jpg' },
];

function crearMarcadores(lugares, onPress) {
  const marcadores = [];
  for (const lugar of lugares) {
    marcadores.push({
      id: lugar.id,
      title: lugar.title,
      description: lugar.club ? `${lugar.club} · ${lugar.city}` : lugar.description,
      lugar,
      latitude: lugar.latitude,
      longitude: lugar.longitude,
      onPress: () => onPress(lugar),
    });
  }
  return marcadores;
}

export default function MapScreen() {
  const [lugares, setLugares] = useState(ESTADIOS_INICIALES);
  const [ubicacion, setUbicacion] = useState(null);
  const [estadoPermiso, setEstadoPermiso] = useState('pending');
  const [mensaje, setMensaje] = useState('');
  const [modal, setModal] = useState('');
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [latitudTexto, setLatitudTexto] = useState('');
  const [longitudTexto, setLongitudTexto] = useState('');
  const [imagen, setImagen] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const [centroMapa, setCentroMapa] = useState(CENTRO_ARGENTINA);
  const [zoomMapa, setZoomMapa] = useState(5);
  const [revisionMapa, setRevisionMapa] = useState(0);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active || !saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setLugares(parsed);
      })
      .catch(() => {
        if (active) setMensaje('No se pudieron cargar los puntos guardados.');
      });

    const obtainLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        setEstadoPermiso(permission.granted ? 'granted' : 'denied');
        if (!permission.granted) {
          setMensaje('Activa el permiso para mostrar tu ubicación en el mapa.');
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) setUbicacion(current.coords);
      } catch {
        if (active) setMensaje('No se pudo obtener la ubicación del dispositivo.');
      }
    };

    obtainLocation();
    return () => { active = false; };
  }, []);

  const requestLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setEstadoPermiso(permission.granted ? 'granted' : 'denied');
      if (!permission.granted) {
        setMensaje('El permiso de ubicación no fue concedido. Puedes cambiarlo en ajustes.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUbicacion(current.coords);
      setMensaje('');
    } catch {
      setMensaje('No se pudo obtener la ubicación actual.');
    }
  };

  const chooseImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso necesario', 'Permite acceder a tus fotos para adjuntar una imagen.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (!result.canceled && result.assets.length > 0) setImagen(result.assets[0].uri);
    } catch {
      Alert.alert('No se pudo abrir la galería', 'Inténtalo nuevamente.');
    }
  };

  const openNewPlace = () => {
    setTitulo('');
    setDescripcion('');
    setLatitudTexto(ubicacion ? String(ubicacion.latitude) : '');
    setLongitudTexto(ubicacion ? String(ubicacion.longitude) : '');
    setImagen('');
    setErrorFormulario('');
    setLugarSeleccionado(null);
    setModal('new');
  };

  const savePlace = async () => {
    if (!titulo.trim() || !descripcion.trim() || !latitudTexto.trim() || !longitudTexto.trim()) {
      setErrorFormulario('Completa el nombre, la descripción, la latitud y la longitud.');
      return;
    }
    const latitude = Number(latitudTexto);
    const longitude = Number(longitudTexto);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setErrorFormulario('La latitud debe ser un número entre -90 y 90.');
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setErrorFormulario('La longitud debe ser un número entre -180 y 180.');
      return;
    }
    const nuevoLugar = {
      id: `lugar-${Date.now()}`,
      title: titulo.trim(),
      description: descripcion.trim(),
      image: imagen,
      latitude,
      longitude,
    };
    const nuevosLugares = [nuevoLugar, ...lugares];
    setLugares(nuevosLugares);
    setCentroMapa({ latitude, longitude });
    setZoomMapa(14);
    setRevisionMapa((revision) => revision + 1);
    setModal('');
    setMensaje('Punto guardado en tu mapa.');
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosLugares));
    } catch {
      setMensaje('El punto aparece en el mapa, pero no se pudo guardar en el dispositivo.');
    }
  };

  const openDetails = (lugar) => {
    setLugarSeleccionado(lugar);
    setModal('details');
  };

  const nativeMarkers = crearMarcadores(lugares, openDetails);

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>ARGENTINA · CLUBES Y CANCHAS</Text>
          <Text style={styles.heading}>Estadios de fútbol</Text>
        </View>
        <Pressable accessibilityLabel="Agregar un estadio" accessibilityRole="button" onPress={openNewPlace} style={styles.addButton}>
          <Ionicons color={tema.colors.white} name="add" size={25} />
        </Pressable>
      </View>

      {mensaje ? <Text accessibilityRole="alert" style={styles.message}>{mensaje}</Text> : null}
      {estadoPermiso !== 'granted' ? (
        <Pressable accessibilityRole="button" onPress={requestLocation} style={styles.permissionRow}>
          <Ionicons color={tema.colors.greenDark} name="navigate-outline" size={17} />
          <Text style={styles.permissionText}>Permitir ubicación actual</Text>
          <Ionicons color={tema.colors.greenDark} name="arrow-forward" size={15} />
        </Pressable>
      ) : null}

      <View style={styles.mapFrame}>
        <StadiumMap
          center={centroMapa}
          markers={nativeMarkers}
          onMarkerPress={openDetails}
          revision={revisionMapa}
          showUserLocation={estadoPermiso === 'granted'}
          zoom={zoomMapa}
        />
        {estadoPermiso === 'pending' ? (
          <View style={styles.loadingBadge}><ActivityIndicator color={tema.colors.green} /><Text style={styles.loadingText}>Buscando ubicación</Text></View>
        ) : null}
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>Estadios en el mapa</Text>
        <Text style={styles.listCount}>{lugares.length}</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={lugares}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => openDetails(item)} style={styles.placeChip}>
            <View style={styles.pin}><Ionicons color={tema.colors.green} name="location" size={14} /></View>
            <Text numberOfLines={1} style={styles.placeName}>{item.title}</Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.aiButtonContainer}>
        <Pressable
          style={styles.aiButton}
          onPress={() => {
            console.log("Botón presionado");
            Alert.alert(
              'Asistente de Punto Sur',
              'Esta aplicación es tu guía personal para explorar estadios de fútbol en Argentina.\n\n• Explora el mapa para ver canchas icónicas.\n• Agrega tus propios lugares favoritos.\n• Sube fotos y detalles personales.\n• Gestiona tu propia colección de estadios visitados.'
            );
          }}
        >
          <Ionicons color={tema.colors.white} name="sparkles" size={24} />
        </Pressable>
      </View>

      <Modal
        footer={modal === 'new' ? <>
          <CustomButton onPress={savePlace} title="Guardar punto" />
          <CustomButton onPress={() => setModal('')} title="Cancelar" variant="quiet" />
        </> : null}
        onClose={() => setModal('')}
        title={modal === 'new' ? 'Nuevo estadio' : lugarSeleccionado?.title || 'Detalle del estadio'}
        visible={modal !== ''}
      >
        {modal === 'new' ? (
          <>
            <Text style={styles.modalHint}>Ingresa las coordenadas del estadio en cualquier lugar del mundo. Si hay permiso, se completan con tu posición actual.</Text>
            {errorFormulario ? <Text accessibilityRole="alert" style={styles.formError}>{errorFormulario}</Text> : null}
            <InputField label="Nombre del estadio" onChangeText={(value) => { setTitulo(value); setErrorFormulario(''); }} placeholder="Ej. Estadio de mi club" value={titulo} />
            <InputField label="Descripción" multiline onChangeText={(value) => { setDescripcion(value); setErrorFormulario(''); }} placeholder="Club, ciudad y algún dato del estadio" value={descripcion} />
            <View style={styles.coordinatesRow}>
              <InputField label="Latitud" onChangeText={(value) => { setLatitudTexto(value); setErrorFormulario(''); }} placeholder="-34.6037" style={styles.coordinateField} value={latitudTexto} />
              <InputField label="Longitud" onChangeText={(value) => { setLongitudTexto(value); setErrorFormulario(''); }} placeholder="-58.3816" style={styles.coordinateField} value={longitudTexto} />
            </View>
            <CustomButton
              icon={<Ionicons color={tema.colors.greenDark} name="image-outline" size={18} />}
              onPress={chooseImage}
              title={imagen ? 'Cambiar foto' : 'Agregar foto del estadio'}
              variant="secondary"
            />
            {imagen ? <Image resizeMode="cover" source={{ uri: imagen }} style={styles.preview} /> : null}
          </>
        ) : (
          <>
            {lugarSeleccionado?.image ? <Image resizeMode="cover" source={{ uri: lugarSeleccionado.image }} style={styles.detailImage} /> : null}
            {lugarSeleccionado?.club ? <Text style={styles.clubName}>{lugarSeleccionado.club}</Text> : null}
            {lugarSeleccionado?.city ? <Text style={styles.cityName}>{lugarSeleccionado.city}</Text> : null}
            <Text style={styles.detailDescription}>{lugarSeleccionado?.description}</Text>
            <Text style={styles.coordinates}>LAT {lugarSeleccionado?.latitude.toFixed(4)}  ·  LNG {lugarSeleccionado?.longitude.toFixed(4)}</Text>
          </>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tema.colors.paper, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  topbar: { minHeight: 63, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headingCopy: { flex: 1 },
  eyebrow: { color: tema.colors.coral, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  heading: { marginTop: 4, color: tema.colors.ink, fontSize: 22, fontWeight: '800' },
  addButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: tema.colors.green, alignItems: 'center', justifyContent: 'center' },
  message: { marginBottom: 7, color: tema.colors.muted, fontSize: 12 },
  permissionRow: { minHeight: 39, marginBottom: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 7, backgroundColor: tema.colors.mint },
  permissionText: { flex: 1, color: tema.colors.greenDark, fontSize: 12, fontWeight: '700' },
  mapFrame: { flex: 1, minHeight: 250, overflow: 'hidden', borderRadius: 9, borderWidth: 1, borderColor: tema.colors.line, backgroundColor: '#E8ECE5' },
  loadingBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 6, backgroundColor: tema.colors.white },
  loadingText: { color: tema.colors.ink, fontSize: 11, fontWeight: '700' },
  listHeading: { height: 41, flexDirection: 'row', alignItems: 'center', gap: 8 },
  listTitle: { color: tema.colors.ink, fontSize: 13, fontWeight: '800' },
  listCount: { color: tema.colors.muted, fontSize: 12 },
  listContent: { gap: 8, paddingBottom: 4 },
  placeChip: { maxWidth: 190, minHeight: 37, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 7, borderWidth: 1, borderColor: tema.colors.line, backgroundColor: tema.colors.white },
  pin: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  placeName: { flexShrink: 1, color: tema.colors.ink, fontSize: 12, fontWeight: '700' },
  modalHint: { marginBottom: 17, color: tema.colors.muted, fontSize: 13, lineHeight: 19 },
  formError: { marginBottom: 12, color: tema.colors.error, fontSize: 13, lineHeight: 18 },
  coordinatesRow: { flexDirection: 'row', gap: 12 },
  coordinateField: { flex: 1 },
  preview: { width: '100%', height: 170, marginTop: 13, borderRadius: 8 },
  detailImage: { width: '100%', height: 195, marginBottom: 16, borderRadius: 8 },
  clubName: { color: tema.colors.greenDark, fontSize: 13, fontWeight: '800' },
  cityName: { marginTop: 4, marginBottom: 12, color: tema.colors.muted, fontSize: 12 },
  detailDescription: { color: tema.colors.ink, fontSize: 15, lineHeight: 23 },
  coordinates: { marginTop: 20, color: tema.colors.muted, fontSize: 11, fontWeight: '700' },
  aiButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 9999,
    elevation: 20,
  },
  aiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tema.colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});