import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tema from '../utils/tema';
import { resolverImagen, uriImagen } from '../utils/imagenes';

const CSS_LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const JS_LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const CENTRO_POR_DEFECTO = { latitude: -33.1, longitude: -63.7 };

let promesaLeaflet = null;
let estilosInyectados = false;

function escaparHtml(valor = '') {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inyectarEstilos() {
  if (estilosInyectados || typeof document === 'undefined') return;
  estilosInyectados = true;

  if (!document.querySelector('link[data-puntosure-leaflet="v3"]')) {
    document.querySelectorAll('link[data-puntosure-leaflet]').forEach((nodo) => nodo.remove());
    const estilos = document.createElement('link');
    estilos.rel = 'stylesheet';
    estilos.href = CSS_LEAFLET;
    estilos.dataset.puntosureLeaflet = 'v3';
    document.head.appendChild(estilos);
  }

  if (!document.querySelector('style[data-puntosure-mapa="v3"]')) {
    // Si queda una hoja vieja de otra versión (hot reload de Snack), se reemplaza.
    document.querySelectorAll('style[data-puntosure-mapa]').forEach((nodo) => nodo.remove());
    const estilo = document.createElement('style');
    estilo.dataset.puntosureMapa = 'v3';
    estilo.textContent = `
      .ps-map-host { position: absolute; inset: 0; z-index: 0; background: #E8ECE5; }
      .ps-map-host .leaflet-container { font-family: inherit; background: #E8ECE5; }
      .ps-map-host .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.82); color: #66736D; }
      .ps-map-host .leaflet-control-attribution a { color: #18523F; }
      .ps-map-host .leaflet-control-zoom { border: 0; box-shadow: 0 6px 18px rgba(16,35,28,.18); border-radius: 10px; overflow: hidden; }
      .ps-map-host .leaflet-control-zoom a { width: 30px; height: 30px; line-height: 30px; color: #18523F; background: #fff; border-color: #DDE2DA; }
      .ps-map-host .leaflet-control-zoom a:hover { background: #E4F0E9; }
      .ps-map-host .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 18px 42px rgba(16,35,28,.26); }
      .ps-map-host .leaflet-popup-content { margin: 0; width: 250px !important; }
      .ps-map-host .leaflet-popup-tip { box-shadow: 0 4px 12px rgba(16,35,28,.16); }
      .ps-map-host .leaflet-popup-close-button { width: 24px; height: 24px; line-height: 22px; top: 6px; right: 6px; border-radius: 12px; background: rgba(255,255,255,.9); color: #1D2925; font-size: 18px; }
      .ps-pin-host { background: transparent; border: 0; }
      .ps-pin { position: relative; width: 30px; height: 42px; display: flex; align-items: flex-start; justify-content: center; filter: drop-shadow(0 5px 7px rgba(16,35,28,.3)); transition: transform .16s ease; transform-origin: 50% 95%; }
      .ps-pin:hover { transform: scale(1.12); }
      .ps-pin::before { content: ''; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: #24745A; border: 2.5px solid #fff; box-sizing: border-box; }
      .ps-pin-dot { position: absolute; top: 7px; width: 11px; height: 11px; border-radius: 50%; background: #fff; }
      .ps-pin--manual::before { background: #B83D35; }
      .ps-pin--manual .ps-pin-dot { background: #fff; }
      .ps-pin-fallback { display: none; }
      .ps-popup-card { background: #fff; }
      .ps-popup-img { width: 100%; height: 112px; object-fit: cover; display: block; background: #E4F0E9; }
      .ps-popup-img--empty { display: flex; align-items: center; justify-content: center; font-size: 26px; }
      .ps-popup-body { padding: 12px 13px 13px; }
      .ps-popup-name { color: #1D2925; font-size: 14px; font-weight: 800; line-height: 18px; }
      .ps-popup-meta { margin-top: 3px; color: #66736D; font-size: 11px; font-weight: 600; }
      .ps-popup-btn { width: 100%; margin-top: 10px; padding: 9px 10px; border: 0; border-radius: 9px; background: #24745A; color: #fff; font-size: 12px; font-weight: 800; cursor: pointer; transition: background .15s ease; }
      .ps-popup-btn:hover { background: #18523F; }
      .ps-user-wrap { background: transparent; border: 0; }
      .ps-user-dot { width: 22px; height: 22px; border-radius: 50%; background: rgba(36,116,90,.2); display: flex; align-items: center; justify-content: center; }
      .ps-user-dot span { width: 12px; height: 12px; border-radius: 50%; background: #24745A; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(16,35,28,.4); }
    `;
    document.head.appendChild(estilo);
  }
}

function cargarLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Sin navegador'));
  if (window.L) return Promise.resolve(window.L);
  if (promesaLeaflet) return promesaLeaflet;

  inyectarEstilos();

  promesaLeaflet = new Promise((resolve, reject) => {
    const existente = document.querySelector('script[data-puntosure-leaflet]');
    if (existente) {
      const alCargar = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet no disponible')));
      existente.addEventListener('load', alCargar);
      existente.addEventListener('error', () => reject(new Error('No se pudo cargar Leaflet')));
      if (window.L) resolve(window.L);
      return;
    }

    const script = document.createElement('script');
    script.src = JS_LEAFLET;
    script.async = true;
    script.dataset.puntosureLeaflet = 'true';
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet no disponible')));
    script.onerror = () => reject(new Error('No se pudo cargar Leaflet'));
    document.head.appendChild(script);
  }).catch((error) => {
    promesaLeaflet = null;
    throw error;
  });

  return promesaLeaflet;
}

function iconoEstadio(L, lugar = {}) {
  const esManual = Boolean(lugar.manual) || String(lugar.id || '').startsWith('lugar-');
  const clase = esManual ? 'ps-pin ps-pin--manual' : 'ps-pin';
  return L.divIcon({
    className: 'ps-pin-host',
    html: `<div class="${clase}"><span class="ps-pin-dot"></span></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
    tooltipAnchor: [0, -38],
  });
}

function imagenPopup(lugar = {}) {
  // En la web preferimos la URL remota (funciona en Snack) y caemos a la local si no hay.
  return lugar.imageRemote || uriImagen(lugar.image);
}

function popupEstadio(marker) {
  const lugar = marker.lugar || {};
  const imagen = imagenPopup(lugar);
  const detalle = [lugar.club, lugar.city].filter(Boolean).join(' · ') || 'Punto guardado';

  return `<div class="ps-popup-card">
    ${
      imagen
        ? `<img class="ps-popup-img" src="${escaparHtml(imagen)}" alt="${escaparHtml(lugar.title || '')}" />`
        : '<div class="ps-popup-img ps-popup-img--empty">⚽</div>'
    }
    <div class="ps-popup-body">
      <div class="ps-popup-name">${escaparHtml(lugar.title || 'Estadio')}</div>
      <div class="ps-popup-meta">${escaparHtml(detalle)}</div>
      <button type="button" class="ps-popup-btn" data-place-id="${escaparHtml(lugar.id || '')}">Ver ficha completa</button>
    </div>
  </div>`;
}

export default function StadiumMap({ center, markers = [], onMarkerPress, onLongPress, revision, showUserLocation, userLocation, zoom }) {
  const hostRef = useRef(null);
  const capasRef = useRef(null);
  const markersRef = useRef(markers);
  const pressRef = useRef(onMarkerPress);
  const longPressRef = useRef(onLongPress);
  const primeraVistaRef = useRef(true);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const centro = center || CENTRO_POR_DEFECTO;

  markersRef.current = markers;
  pressRef.current = onMarkerPress;
  longPressRef.current = onLongPress;

  useEffect(() => {
    let cancelado = false;
    setError(false);
    setListo(false);
    primeraVistaRef.current = true;

    cargarLeaflet()
      .then((L) => {
        if (cancelado || !hostRef.current) return;

        const map = L.map(hostRef.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: true,
          minZoom: 3,
          maxZoom: 18,
          zoomSnap: 0.25,
          worldCopyJump: true,
        });
        map.attributionControl.setPrefix(false);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        map.setView([centro.latitude, centro.longitude], zoom === 5 ? 5 : 13);

        const capaMarcadores = L.layerGroup().addTo(map);
        const capaUbicacion = L.layerGroup().addTo(map);

        const manejarClick = (event) => {
          if (presionEjecutada) {
            presionEjecutada = false;
            return;
          }
          if (typeof Element === 'undefined' || !(event.target instanceof Element)) return;
          const boton = event.target.closest('[data-place-id]');
          if (!boton) return;
          const id = boton.getAttribute('data-place-id');
          const encontrado = markersRef.current.find((item) => item.lugar?.id === id);
          if (encontrado && pressRef.current) pressRef.current(encontrado.lugar);
        };
        hostRef.current.addEventListener('click', manejarClick);

        // Presión larga en el mapa: agrega un pin o abre opciones si se mantiene sobre uno.
        let presionTimer = null;
        let inicioPresion = null;
        let presionEjecutada = false;

        const puntoDe = (event) => ({
          x: event.touches?.[0]?.clientX ?? event.clientX,
          y: event.touches?.[0]?.clientY ?? event.clientY,
        });

        const iniciarPresion = (event) => {
          presionEjecutada = false;
          if (event.type === 'mousedown' && event.button !== 0) return;
          if (event.target instanceof Element && event.target.closest('.leaflet-popup, .leaflet-control')) return;
          inicioPresion = puntoDe(event);
          clearTimeout(presionTimer);
          presionTimer = setTimeout(() => {
            presionEjecutada = true;
            if (!hostRef.current || !inicioPresion) return;
            const rect = hostRef.current.getBoundingClientRect();
            const punto = L.point(inicioPresion.x - rect.left, inicioPresion.y - rect.top);
            const latlng = map.containerPointToLatLng(punto);
            longPressRef.current?.({ latitude: latlng.lat, longitude: latlng.lng });
          }, 550);
        };

        const detenerPresion = () => clearTimeout(presionTimer);

        const moverPresion = (event) => {
          if (!inicioPresion) return;
          const punto = puntoDe(event);
          if (Math.abs(punto.x - inicioPresion.x) > 12 || Math.abs(punto.y - inicioPresion.y) > 12) {
            detenerPresion();
          }
        };

        const eventosPresion = [
          ['mousedown', iniciarPresion],
          ['touchstart', iniciarPresion, { passive: true }],
          ['mousemove', moverPresion],
          ['mouseup', detenerPresion],
          ['touchend', detenerPresion],
          ['touchmove', detenerPresion, { passive: true }],
          ['mouseleave', detenerPresion],
        ];
        eventosPresion.forEach(([tipo, funcion, opciones]) => hostRef.current.addEventListener(tipo, funcion, opciones));

        let observador;
        if (typeof ResizeObserver !== 'undefined') {
          observador = new ResizeObserver(() => map.invalidateSize());
          observador.observe(hostRef.current);
        }

        requestAnimationFrame(() => map.invalidateSize());

        capasRef.current = {
          L,
          map,
          capaMarcadores,
          capaUbicacion,
          observador,
          manejarClick,
          eventosPresion,
          detenerPresion,
        };
        setListo(true);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });

    return () => {
      cancelado = true;
      const capas = capasRef.current;
      if (capas) {
        capas.observador?.disconnect();
        capas.detenerPresion?.();
        if (hostRef.current) {
          if (capas.manejarClick) hostRef.current.removeEventListener('click', capas.manejarClick);
          capas.eventosPresion?.forEach(([tipo, funcion, opciones]) => {
            hostRef.current?.removeEventListener(tipo, funcion, opciones);
          });
        }
        capas.map?.remove();
      }
      capasRef.current = null;
      setListo(false);
    };
    // Solo se reinicia cuando se pide reintentar; el mapa se reutiliza para el resto de los cambios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento]);

  useEffect(() => {
    const capas = capasRef.current;
    if (!capas || !listo) return;
    const { L, capaMarcadores } = capas;
    capaMarcadores.clearLayers();

    markers.forEach((marker) => {
      if (!Number.isFinite(marker.latitude) || !Number.isFinite(marker.longitude)) return;
      const capa = L.marker([marker.latitude, marker.longitude], {
        icon: iconoEstadio(L, marker.lugar),
        title: marker.title,
        riseOnHover: true,
        keyboard: false,
      }).addTo(capaMarcadores);

      capa.bindPopup(popupEstadio(marker), {
        className: 'ps-popup',
        maxWidth: 240,
        minWidth: 220,
        autoPanPadding: [30, 30],
        closeButton: true,
      });
    });
  }, [markers, listo]);

  useEffect(() => {
    const capas = capasRef.current;
    if (!capas || !listo) return;
    const { L, capaUbicacion } = capas;
    capaUbicacion.clearLayers();
    if (!showUserLocation || !userLocation?.latitude || !userLocation?.longitude) return;

    const posicion = [userLocation.latitude, userLocation.longitude];
    L.circle(posicion, {
      radius: 350,
      color: tema.colors.green,
      weight: 1,
      opacity: 0.35,
      fillColor: tema.colors.green,
      fillOpacity: 0.12,
    }).addTo(capaUbicacion);
    L.marker(posicion, {
      icon: L.divIcon({
        className: 'ps-user-wrap',
        html: '<div class="ps-user-dot"><span></span></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(capaUbicacion);
  }, [showUserLocation, userLocation, listo]);

  useEffect(() => {
    const capas = capasRef.current;
    if (!capas || !listo) return;
    const zoomFinal = zoom === 5 ? 5 : Math.max(zoom || 13, 12);
    if (primeraVistaRef.current) {
      primeraVistaRef.current = false;
      capas.map.setView([centro.latitude, centro.longitude], zoomFinal);
      return;
    }
    capas.map.flyTo([centro.latitude, centro.longitude], zoomFinal, {
      duration: 1,
      easeLinearity: 0.25,
    });
  }, [centro.latitude, centro.longitude, zoom, revision, listo]);

  return (
    <View style={styles.wrap}>
      <div className="ps-map-host" ref={hostRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {!listo && !error ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tema.colors.green} />
          <Text style={styles.loadingText}>Preparando el mapa interactivo…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.fallback}>
          <View style={styles.fallbackHead}>
            <Ionicons color={tema.colors.coral} name="map-outline" size={22} />
            <View style={styles.fallbackCopy}>
              <Text style={styles.fallbackTitle}>No pudimos cargar el mapa</Text>
              <Text style={styles.fallbackText}>Revisá tu conexión o elegí un estadio de la lista.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIntento((valor) => valor + 1)}
              style={styles.retry}
            >
              <Ionicons color={tema.colors.greenDark} name="refresh" size={16} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.fallbackList} showsVerticalScrollIndicator={false}>
            {markers.map((marker) => (
              <Pressable
                accessibilityRole="button"
                key={marker.id}
                onPress={() => onMarkerPress?.(marker.lugar)}
                style={styles.fallbackRow}
              >
                {marker.lugar?.image ? (
                  <Image source={resolverImagen(marker.lugar.image)} style={styles.fallbackImage} />
                ) : (
                  <View style={[styles.fallbackImage, styles.fallbackImageEmpty]}>
                    <Ionicons color={tema.colors.green} name="football" size={20} />
                  </View>
                )}
                <View style={styles.fallbackBody}>
                  <Text numberOfLines={1} style={styles.fallbackName}>{marker.title}</Text>
                  <Text numberOfLines={1} style={styles.fallbackMeta}>{marker.description}</Text>
                </View>
                <Ionicons color={tema.colors.muted} name="chevron-forward" size={16} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 240,
    overflow: 'hidden',
    backgroundColor: tema.colors.mapBg,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: tema.colors.mapBg,
  },
  loadingText: {
    color: tema.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    backgroundColor: tema.colors.paper,
  },
  fallbackHead: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: tema.colors.coralSoft,
  },
  fallbackCopy: {
    flex: 1,
  },
  fallbackTitle: {
    color: tema.colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  fallbackText: {
    marginTop: 2,
    color: tema.colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  retry: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.white,
  },
  fallbackList: {
    paddingTop: 10,
    gap: 8,
  },
  fallbackRow: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.white,
  },
  fallbackImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  fallbackImageEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.mint,
  },
  fallbackBody: {
    flex: 1,
  },
  fallbackName: {
    color: tema.colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  fallbackMeta: {
    marginTop: 2,
    color: tema.colors.muted,
    fontSize: 11,
  },
});
