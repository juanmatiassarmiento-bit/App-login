import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AssistantModal from '../components/AssistantModal';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import StadiumMap from '../components/StadiumMap';
import { ESTADIOS_INICIALES } from '../data/estadios';
import { resolverImagen } from '../utils/imagenes';
import { IMAGEN_GENERICA_ESTADIO } from '../utils/imagenes';
import tema from '../utils/tema';

const STORAGE_KEY = '@punto-sur/estadios';
const CENTRO_ARGENTINA = { latitude: -33.1, longitude: -63.7 };

async function leerUbicacion() {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocalización no disponible'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        () => reject(new Error('Permiso denegado')),
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
      );
    });
  }

  const permiso = await Location.requestForegroundPermissionsAsync();
  if (!permiso.granted) throw new Error('Permiso denegado');
  const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: actual.coords.latitude, longitude: actual.coords.longitude };
}

function migrarGuardados(guardados) {
  return guardados.map((item) => {
    const base = ESTADIOS_INICIALES.find((estadio) => estadio.id === item.id);
    // Un pin es "manual" si lo marcamos así o si su id no corresponde al catálogo
    // (cubre los guardados antes de que existiera la bandera).
    const manual = Boolean(item.manual) || !base;
    if (base && typeof item.image === 'string' && /^https?:/i.test(item.image)) {
      return { ...item, image: base.image, manual };
    }
    return { ...item, manual };
  });
}

function Buscador({ valor, onChange, compacto }) {
  return (
    <View style={[styles.search, compacto && styles.searchCompact]}>
      <Ionicons color={tema.colors.muted} name="search-outline" size={17} />
      <TextInput
        accessibilityLabel="Buscar estadio"
        autoCorrect={false}
        onChangeText={onChange}
        placeholder="Buscar club, ciudad o estadio"
        placeholderTextColor="#93A099"
        style={styles.searchInput}
        value={valor}
      />
      {valor ? (
        <Pressable accessibilityLabel="Borrar búsqueda" accessibilityRole="button" onPress={() => onChange('')} style={styles.searchClear}>
          <Ionicons color={tema.colors.muted} name="close-circle" size={17} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [lugares, setLugares] = useState(ESTADIOS_INICIALES);
  const [ubicacion, setUbicacion] = useState(null);
  const [estadoPermiso, setEstadoPermiso] = useState(Platform.OS === 'web' ? 'idle' : 'pending');
  const [mensaje, setMensaje] = useState('');
  const [modal, setModal] = useState('');
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [asistenteAbierto, setAsistenteAbierto] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [latitudTexto, setLatitudTexto] = useState('');
  const [longitudTexto, setLongitudTexto] = useState('');
  const [imagen, setImagen] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const [centroMapa, setCentroMapa] = useState(CENTRO_ARGENTINA);
  const [zoomMapa, setZoomMapa] = useState(5);
  const [revisionMapa, setRevisionMapa] = useState(0);
  const toastTimer = useRef(null);

  // Animaciones del FAB y del toast
  const pulso = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrada, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [entrada, pulso]);

  useEffect(() => {
    if (!mensaje) return;
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [mensaje, toastAnim]);

  const mostrarToast = useCallback((texto) => {
    setMensaje(texto);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMensaje(''), 4500);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((guardado) => {
        if (!activo || !guardado) return;
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado) && parseado.length) {
          setLugares(migrarGuardados(parseado));
        }
      })
      .catch(() => {
        if (activo) mostrarToast('No pudimos cargar los puntos guardados.');
      });

    return () => {
      activo = false;
    };
  }, [mostrarToast]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    let activo = true;

    (async () => {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();
        if (!activo) return;
        if (!permiso.granted) {
          setEstadoPermiso('denied');
          return;
        }
        setEstadoPermiso('granted');
        const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (activo) setUbicacion({ latitude: actual.coords.latitude, longitude: actual.coords.longitude });
      } catch {
        if (activo) setEstadoPermiso('denied');
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const requestLocation = useCallback(async () => {
    try {
      setEstadoPermiso('pending');
      const coords = await leerUbicacion();
      setUbicacion(coords);
      setEstadoPermiso('granted');
      setCentroMapa(coords);
      setZoomMapa(14);
      setRevisionMapa((revision) => revision + 1);
      mostrarToast('Ubicación lista. El mapa se centró en tu posición.');
    } catch {
      setEstadoPermiso('denied');
      mostrarToast('No pudimos acceder a tu ubicación. Revisá los permisos del navegador o del celular.');
    }
  }, [mostrarToast]);

  const chooseImage = useCallback(async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso necesario', 'Permití el acceso a tus fotos para adjuntar una imagen.');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (!resultado.canceled && resultado.assets.length) setImagen(resultado.assets[0].uri);
    } catch {
      Alert.alert('No pudimos abrir la galería', 'Intentá nuevamente en unos segundos.');
    }
  }, []);

  const openNewPlace = useCallback(() => {
    setTitulo('');
    setDescripcion('');
    setLatitudTexto(ubicacion ? String(ubicacion.latitude) : '');
    setLongitudTexto(ubicacion ? String(ubicacion.longitude) : '');
    setImagen('');
    setErrorFormulario('');
    setLugarSeleccionado(null);
    setModal('new');
  }, [ubicacion]);

  const savePlace = useCallback(async () => {
    if (!titulo.trim() || !descripcion.trim() || !latitudTexto.trim() || !longitudTexto.trim()) {
      setErrorFormulario('Completá el nombre, la descripción, la latitud y la longitud.');
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
      manual: true, // pin agregado por el usuario: se pinta en otro color
      latitude,
      longitude,
    };
    const nuevosLugares = [nuevoLugar, ...lugares];
    setLugares(nuevosLugares);
    setBusqueda('');
    setCentroMapa({ latitude, longitude });
    setZoomMapa(15);
    setRevisionMapa((revision) => revision + 1);
    setModal('');
    mostrarToast('Estadio guardado. Ya aparece en tu mapa.');

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosLugares));
    } catch {
      mostrarToast('El punto aparece en el mapa, pero no pudimos guardarlo en este dispositivo.');
    }
  }, [descripcion, imagen, latitudTexto, longitudTexto, lugares, mostrarToast, titulo]);

  const openDetails = useCallback((lugar) => {
    setLugarSeleccionado(lugar);
    setModal('details');
  }, []);

  const manejarPresionLarga = useCallback(({ latitude, longitude }) => {
    // ¿El punto cae sobre un pin existente? (~300 m de tolerancia)
    const cerca = lugaresFiltrados.find(
      (lugar) => Math.abs(lugar.latitude - latitude) < 0.003 && Math.abs(lugar.longitude - longitude) < 0.003,
    );
    if (cerca) {
      setPendienteEliminar(cerca);
      return;
    }
    setTitulo('');
    setDescripcion('');
    setImagen('');
    setErrorFormulario('');
    setLugarSeleccionado(null);
    setLatitudTexto(latitude.toFixed(5));
    setLongitudTexto(longitude.toFixed(5));
    setModal('new');
  }, [lugaresFiltrados]);

  const eliminarLugar = useCallback(async () => {
    const lugar = pendienteEliminar;
    if (!lugar) return;
    const restantes = lugares.filter((item) => item.id !== lugar.id);
    setLugares(restantes);
    setPendienteEliminar(null);
    mostrarToast(`${lugar.title} se quitó del mapa.`);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restantes));
    } catch {
      mostrarToast('No se pudo guardar el cambio en este dispositivo.');
    }
  }, [lugares, pendienteEliminar, mostrarToast]);

  const centrarEnMapa = useCallback((lugar) => {
    if (!lugar) return;
    setCentroMapa({ latitude: lugar.latitude, longitude: lugar.longitude });
    setZoomMapa(15);
    setRevisionMapa((revision) => revision + 1);
    setModal('');
    mostrarToast(`Mapa centrado en ${lugar.title}.`);
  }, [mostrarToast]);

  const lugaresFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();
    if (!consulta) return lugares;
    return lugares.filter((lugar) => {
      const texto = [lugar.title, lugar.club, lugar.city, lugar.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return texto.includes(consulta);
    });
  }, [busqueda, lugares]);

  const marcadores = useMemo(
    () =>
      lugaresFiltrados.map((lugar) => ({
        id: lugar.id,
        title: lugar.title,
        description: lugar.club ? `${lugar.club} · ${lugar.city}` : lugar.description,
        lugar,
        latitude: lugar.latitude,
        longitude: lugar.longitude,
      })),
    [lugaresFiltrados],
  );

  const esInicial = ESTADIOS_INICIALES.some((estadio) => estadio.id === lugarSeleccionado?.id);

  return (
    <View style={[styles.screen, wide && styles.screenWide]}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Ionicons color={tema.colors.white} name="football" size={19} />
        </View>
        <View style={styles.headingCopy}>
          <Text numberOfLines={1} style={styles.eyebrow}>PUNTO SUR · MAPA DE CLUBES</Text>
          <Text numberOfLines={1} style={[styles.heading, wide && styles.headingWide]}>Estadios de fútbol</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Agregar un estadio"
            accessibilityRole="button"
            onPress={openNewPlace}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Ionicons color={tema.colors.white} name="add" size={24} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.mapColumn, wide && styles.mapColumnWide]}>
          <View style={styles.mapFrame}>
            <StadiumMap
              center={centroMapa}
              markers={marcadores}
              onLongPress={manejarPresionLarga}
              onMarkerPress={openDetails}
              revision={revisionMapa}
              showUserLocation={estadoPermiso === 'granted'}
              userLocation={ubicacion}
              zoom={zoomMapa}
            />

            <View pointerEvents="box-none" style={styles.mapOverlay}>
              <View style={styles.mapTopRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={requestLocation}
                  style={({ pressed }) => [
                    styles.mapPill,
                    estadoPermiso === 'granted' && styles.mapPillActive,
                    pressed && styles.mapPillPressed,
                  ]}
                >
                  {estadoPermiso === 'pending' ? (
                    <ActivityIndicator color={tema.colors.greenDark} size="small" />
                  ) : (
                    <Ionicons
                      color={estadoPermiso === 'granted' ? tema.colors.white : tema.colors.greenDark}
                      name={estadoPermiso === 'granted' ? 'navigate' : 'navigate-outline'}
                      size={14}
                    />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.mapPillText, estadoPermiso === 'granted' && styles.mapPillTextActive]}
                  >
                    {estadoPermiso === 'pending'
                      ? 'Ubicando…'
                      : estadoPermiso === 'granted'
                        ? 'Mi ubicación'
                        : 'Activar ubicación'}
                  </Text>
                </Pressable>

                <View style={styles.mapPill}>
                  <Ionicons color={tema.colors.coral} name="location" size={14} />
                  <Text style={styles.mapPillText}>
                    {lugaresFiltrados.length} {lugaresFiltrados.length === 1 ? 'estadio' : 'estadios'}
                  </Text>
                </View>
              </View>

              {Platform.OS !== 'web' ? (
                <View style={styles.mapHint}>
                  <Ionicons color={tema.colors.greenDark} name="hand-left-outline" size={13} />
                  <Text style={styles.mapHintText}>Tocá un marcador para ver su ficha</Text>
                </View>
              ) : null}
            </View>

            {mensaje ? (
              <Animated.View
                style={[
                  styles.toast,
                  Platform.OS === 'web' && styles.toastWeb,
                  {
                    opacity: toastAnim,
                    transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                  },
                ]}
              >
                <Ionicons color={tema.colors.greenDark} name="information-circle" size={17} />
                <Text style={styles.toastText}>{mensaje}</Text>
              </Animated.View>
            ) : null}
          </View>
        </View>

        {wide ? (
          <View style={styles.aside}>
            <View style={styles.asideHead}>
              <View style={styles.asideTitleRow}>
                <Text style={styles.asideTitle}>Estadios</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{lugaresFiltrados.length}</Text>
                </View>
              </View>
              <Text style={styles.asideSubtitle}>Elegí una cancha para abrir su ficha.</Text>
            </View>

            <Buscador onChange={setBusqueda} valor={busqueda} />

            <FlatList
              contentContainerStyle={styles.asideList}
              data={lugaresFiltrados}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons color={tema.colors.muted} name="search-outline" size={22} />
                  <Text style={styles.emptyText}>No encontramos estadios para “{busqueda}”.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openDetails(item)}
                  style={({ pressed }) => [styles.cardWide, pressed && styles.cardPressed]}
                >
                  {item.image ? (
                    <Image source={resolverImagen(item.image)} style={styles.cardWideImage} />
                  ) : (
                    <View style={[styles.cardWideImage, styles.cardImageEmpty]}>
                      <Ionicons color={tema.colors.green} name="football" size={22} />
                    </View>
                  )}
                  <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
                    <Text numberOfLines={1} style={styles.cardMeta}>
                      {item.club ? `${item.club} · ${item.city}` : 'Agregado por vos'}
                    </Text>
                    <View style={styles.cardCoordsRow}>
                      <Ionicons color={tema.colors.green} name="location-outline" size={11} />
                      <Text style={styles.cardCoords}>
                        {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons color={tema.colors.lineDark} name="chevron-forward" size={17} />
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.asideListWrap}
            />

            <View style={styles.promo}>
              <View style={styles.promoOrb} />
              <View style={styles.promoAvatar}>
                <Ionicons color={tema.colors.gold} name="sparkles" size={18} />
              </View>
              <View style={styles.promoCopy}>
                <Text style={styles.promoTitle}>¿No sabés cuál elegir?</Text>
                <Text style={styles.promoText}>Suri te recomienda un estadio en segundos.</Text>
              </View>
              <Pressable
                accessibilityLabel="Hablar con Suri"
                accessibilityRole="button"
                onPress={() => setAsistenteAbierto(true)}
                style={({ pressed }) => [styles.promoButton, pressed && styles.promoButtonPressed]}
              >
                <Ionicons color={tema.colors.greenDark} name="arrow-forward" size={17} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      {!wide ? (
        <View style={styles.mobileList}>
          <Buscador compacto onChange={setBusqueda} valor={busqueda} />
          <FlatList
            contentContainerStyle={styles.mobileCards}
            data={lugaresFiltrados}
            horizontal
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyMobile}>
                <Ionicons color={tema.colors.muted} name="search-outline" size={20} />
                <Text style={styles.emptyText}>Sin resultados para “{busqueda}”.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => openDetails(item)}
                style={({ pressed }) => [styles.cardMobile, pressed && styles.cardPressed]}
              >
                {item.image ? (
                  <Image source={resolverImagen(item.image)} style={styles.cardMobileImage} />
                ) : (
                  <View style={[styles.cardMobileImage, styles.cardImageEmpty]}>
                    <Ionicons color={tema.colors.green} name="football" size={24} />
                  </View>
                )}
                <View style={styles.cardMobileBody}>
                  <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.cardMeta}>
                    {item.club ? `${item.club} · ${item.city}` : 'Agregado por vos'}
                  </Text>
                  <View style={styles.cardCoordsRow}>
                    <Ionicons color={tema.colors.green} name="location-outline" size={11} />
                    <Text numberOfLines={1} style={styles.cardCoords}>
                      {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}

      <Animated.View
        style={[styles.fabShell, wide ? styles.fabWide : styles.fabMobile, { transform: [{ scale: entrada }] }]}
      >
        <Animated.View
          style={[
            styles.fabRing,
            {
              opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
            },
          ]}
        />
        <Pressable
          accessibilityLabel="Abrir asistente Suri"
          accessibilityRole="button"
          onPress={() => setAsistenteAbierto(true)}
          style={({ pressed }) => [styles.fabCore, pressed && styles.fabPressed]}
        >
          <View style={styles.fabOrb} />
          <Ionicons color={tema.colors.gold} name="sparkles" size={25} />
        </Pressable>
      </Animated.View>

      <Modal
        footer={
          modal === 'new' ? (
            <>
              <CustomButton
                icon={<Ionicons color={tema.colors.white} name="checkmark-circle-outline" size={18} />}
                onPress={savePlace}
                title="Guardar estadio"
              />
              <CustomButton onPress={() => setModal('')} title="Cancelar" variant="quiet" />
            </>
          ) : modal === 'details' ? (
            <>
              <CustomButton
                icon={<Ionicons color={tema.colors.white} name="locate-outline" size={18} />}
                onPress={() => centrarEnMapa(lugarSeleccionado)}
                title="Ver en el mapa"
              />
              <CustomButton
                onPress={() => {
                  const lugar = lugarSeleccionado;
                  setModal('');
                  setPendienteEliminar(lugar);
                }}
                title="Quitar del mapa"
                variant="quiet"
              />
            </>
          ) : null
        }
        icon={
          <Ionicons
            color={tema.colors.greenDark}
            name={modal === 'new' ? 'add-circle-outline' : 'football-outline'}
            size={22}
          />
        }
        onClose={() => setModal('')}
        subtitle={modal === 'new' ? 'Sumá una cancha a tu colección' : lugarSeleccionado?.club || 'Ficha del estadio'}
        title={modal === 'new' ? 'Nuevo estadio' : lugarSeleccionado?.title || 'Detalle del estadio'}
        visible={modal !== ''}
      >
        {modal === 'new' ? (
          <>
            <View style={styles.formHint}>
              <Ionicons color={tema.colors.greenDark} name="location-outline" size={16} />
              <Text style={styles.formHintText}>
                Mantené apretado el mapa para soltar un pin en ese punto, o ingresá las coordenadas manualmente.
              </Text>
            </View>
            {errorFormulario ? (
              <Text accessibilityRole="alert" style={styles.formError}>{errorFormulario}</Text>
            ) : null}
            <InputField
              label="Nombre del estadio"
              onChangeText={(value) => {
                setTitulo(value);
                setErrorFormulario('');
              }}
              placeholder="Ej. Estadio de mi club"
              value={titulo}
            />
            <InputField
              label="Descripción"
              multiline
              onChangeText={(value) => {
                setDescripcion(value);
                setErrorFormulario('');
              }}
              placeholder="Club, ciudad y algún dato del estadio"
              value={descripcion}
            />
            <View style={styles.coordinatesRow}>
              <InputField
                label="Latitud"
                onChangeText={(value) => {
                  setLatitudTexto(value);
                  setErrorFormulario('');
                }}
                placeholder="-34.6037"
                style={styles.coordinateField}
                value={latitudTexto}
              />
              <InputField
                label="Longitud"
                onChangeText={(value) => {
                  setLongitudTexto(value);
                  setErrorFormulario('');
                }}
                placeholder="-58.3816"
                style={styles.coordinateField}
                value={longitudTexto}
              />
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
            <Image
              resizeMode="cover"
              source={lugarSeleccionado?.image ? resolverImagen(lugarSeleccionado.image) : { uri: IMAGEN_GENERICA_ESTADIO }}
              style={styles.detailImage}
            />

            <View style={styles.detailBadges}>
              <View style={styles.detailBadge}>
                <Ionicons color={tema.colors.greenDark} name={lugarSeleccionado?.club ? 'shield-outline' : 'bookmark-outline'} size={13} />
                <Text numberOfLines={1} style={styles.detailBadgeText}>
                  {lugarSeleccionado?.club || 'Mi colección'}
                </Text>
              </View>
              {lugarSeleccionado?.city ? (
                <View style={[styles.detailBadge, styles.detailBadgeQuiet]}>
                  <Ionicons color={tema.colors.coral} name="location-outline" size={13} />
                  <Text numberOfLines={1} style={styles.detailBadgeQuietText}>{lugarSeleccionado.city}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.detailDescription}>{lugarSeleccionado?.description}</Text>

            <View style={styles.coordPanel}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>LATITUD</Text>
                <Text style={styles.coordValue}>{lugarSeleccionado?.latitude.toFixed(4)}</Text>
              </View>
              <View style={styles.coordDivider} />
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>LONGITUD</Text>
                <Text style={styles.coordValue}>{lugarSeleccionado?.longitude.toFixed(4)}</Text>
              </View>
            </View>

            <Text style={styles.detailCredit}>
              {esInicial ? 'Foto: Wikimedia Commons · Punto Sur' : 'Agregado por vos a tu colección'}
            </Text>
          </>
        )}
      </Modal>

      <Modal
        footer={
          <>
            <CustomButton
              icon={<Ionicons color={tema.colors.white} name="trash-outline" size={18} />}
              onPress={eliminarLugar}
              title="Quitar del mapa"
            />
            <CustomButton onPress={() => setPendienteEliminar(null)} title="Cancelar" variant="quiet" />
          </>
        }
        icon={<Ionicons color={tema.colors.error} name="trash-outline" size={22} />}
        onClose={() => setPendienteEliminar(null)}
        subtitle="Se saca el punto de tu mapa"
        title={`¿Quitar ${pendienteEliminar?.title || 'este pin'}?`}
        visible={!!pendienteEliminar}
      >
        <Text style={styles.deleteText}>
          Podés volver a crearlo cuando quieras manteniendo apretado el mapa en ese punto.
        </Text>
      </Modal>

      <AssistantModal
        lugares={lugares}
        onClose={() => setAsistenteAbierto(false)}
        onVerEstadio={openDetails}
        visible={asistenteAbierto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: tema.colors.paper,
  },
  screenWide: {
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 18,
  },
  header: {
    minHeight: 58,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.green,
    shadowColor: tema.colors.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
  },
  headingCopy: {
    flex: 1,
  },
  eyebrow: {
    color: tema.colors.coral,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  heading: {
    marginTop: 3,
    color: tema.colors.ink,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headingWide: {
    fontSize: 27,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabShell: {
    position: 'absolute',
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  fabMobile: {
    right: 16,
    bottom: 178,
  },
  fabWide: {
    right: 26,
    bottom: 26,
  },
  fabRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: tema.colors.gold,
  },
  fabCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.greenDark,
    overflow: 'hidden',
    shadowColor: '#08140F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
  fabOrb: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    top: -46,
    right: -26,
    backgroundColor: 'rgba(226, 174, 85, 0.16)',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.green,
  },
  addButtonPressed: {
    backgroundColor: tema.colors.greenDark,
  },
  body: {
    flex: 1,
  },
  bodyWide: {
    flexDirection: 'row',
    gap: 20,
  },
  mapColumn: {
    flex: 1,
  },
  mapColumnWide: {
    flex: 1,
  },
  mapFrame: {
    flex: 1,
    minHeight: 250,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tema.colors.lineDark,
    backgroundColor: tema.colors.mapBg,
    shadowColor: '#10231C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  mapTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  mapPill: {
    minHeight: 34,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(221, 226, 218, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    shadowColor: '#10231C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPillActive: {
    backgroundColor: tema.colors.green,
    borderColor: tema.colors.green,
  },
  mapPillPressed: {
    opacity: 0.82,
  },
  mapPillText: {
    color: tema.colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  mapPillTextActive: {
    color: tema.colors.white,
  },
  mapHint: {
    alignSelf: 'flex-start',
    minHeight: 28,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  mapHintText: {
    color: tema.colors.greenDark,
    fontSize: 10,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderWidth: 1,
    borderColor: tema.colors.line,
    shadowColor: '#10231C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  toastWeb: {
    bottom: 54,
  },
  toastText: {
    flex: 1,
    color: tema.colors.inkSoft,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  aside: {
    width: 356,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.cream,
  },
  asideHead: {
    marginBottom: 12,
  },
  asideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  asideTitle: {
    color: tema.colors.ink,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  countBadge: {
    minWidth: 24,
    height: 21,
    paddingHorizontal: 7,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.mint,
  },
  countBadgeText: {
    color: tema.colors.greenDark,
    fontSize: 11,
    fontWeight: '800',
  },
  asideSubtitle: {
    marginTop: 4,
    color: tema.colors.muted,
    fontSize: 12,
  },
  search: {
    minHeight: 46,
    marginBottom: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: tema.colors.lineDark,
    backgroundColor: tema.colors.white,
  },
  searchCompact: {
    minHeight: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 0,
    color: tema.colors.ink,
    fontSize: 13,
  },
  searchClear: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asideListWrap: {
    flex: 1,
  },
  asideList: {
    gap: 9,
    paddingBottom: 12,
  },
  cardWide: {
    minHeight: 82,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.white,
  },
  cardWideImage: {
    width: 64,
    height: 64,
    borderRadius: 11,
  },
  cardPressed: {
    opacity: 0.82,
    borderColor: tema.colors.mintDark,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: tema.colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  cardMeta: {
    marginTop: 3,
    color: tema.colors.muted,
    fontSize: 10.5,
  },
  cardCoordsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardCoords: {
    flexShrink: 1,
    color: tema.colors.greenDark,
    fontSize: 9.5,
    fontWeight: '700',
  },
  cardImageEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.mint,
  },
  empty: {
    padding: 18,
    alignItems: 'center',
    gap: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tema.colors.lineDark,
  },
  emptyMobile: {
    width: 300,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tema.colors.lineDark,
  },
  emptyText: {
    color: tema.colors.muted,
    fontSize: 11.5,
    textAlign: 'center',
  },
  promo: {
    marginTop: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: tema.colors.greenDark,
    overflow: 'hidden',
  },
  promoOrb: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -38,
    top: -54,
    backgroundColor: 'rgba(226, 174, 85, 0.16)',
  },
  promoAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  promoCopy: {
    flex: 1,
  },
  promoTitle: {
    color: tema.colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  promoText: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 10.5,
    lineHeight: 15,
  },
  promoButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.gold,
  },
  promoButtonPressed: {
    opacity: 0.82,
  },
  mobileList: {
    paddingTop: 10,
  },
  mobileCards: {
    gap: 10,
    paddingBottom: 2,
  },
  cardMobile: {
    width: 234,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.white,
    shadowColor: '#10231C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMobileImage: {
    width: 70,
    height: 72,
    borderRadius: 12,
  },
  cardMobileBody: {
    flex: 1,
    paddingVertical: 2,
  },
  formHint: {
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    backgroundColor: tema.colors.mint,
  },
  formHintText: {
    flex: 1,
    color: tema.colors.greenDark,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  formError: {
    marginBottom: 13,
    padding: 10,
    borderRadius: 9,
    backgroundColor: '#F8E5E2',
    color: tema.colors.error,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateField: {
    flex: 1,
  },
  preview: {
    width: '100%',
    height: 180,
    marginTop: 13,
    borderRadius: 13,
    backgroundColor: tema.colors.mint,
  },
  detailImage: {
    width: '100%',
    height: 208,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: tema.colors.mint,
  },
  detailImageEmpty: {
    height: 132,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tema.colors.lineDark,
    backgroundColor: tema.colors.mint,
  },
  detailImageEmptyText: {
    color: tema.colors.greenDark,
    fontSize: 11.5,
    fontWeight: '600',
  },
  detailBadges: {
    marginBottom: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  detailBadge: {
    maxWidth: '100%',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9,
    backgroundColor: tema.colors.mint,
  },
  detailBadgeText: {
    flexShrink: 1,
    color: tema.colors.greenDark,
    fontSize: 11,
    fontWeight: '800',
  },
  detailBadgeQuiet: {
    backgroundColor: tema.colors.coralSoft,
  },
  detailBadgeQuietText: {
    flexShrink: 1,
    color: tema.colors.coral,
    fontSize: 11,
    fontWeight: '800',
  },
  detailDescription: {
    color: tema.colors.ink,
    fontSize: 14.5,
    lineHeight: 22,
  },
  coordPanel: {
    marginTop: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    backgroundColor: tema.colors.cream,
    borderWidth: 1,
    borderColor: tema.colors.line,
  },
  coordItem: {
    flex: 1,
  },
  coordLabel: {
    color: tema.colors.muted,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  coordValue: {
    marginTop: 4,
    color: tema.colors.greenDark,
    fontSize: 14,
    fontWeight: '800',
  },
  coordDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
    backgroundColor: tema.colors.line,
  },
  detailCredit: {
    marginTop: 14,
    color: tema.colors.muted,
    fontSize: 9.5,
  },
  deleteText: {
    color: tema.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 20,
  },
});
