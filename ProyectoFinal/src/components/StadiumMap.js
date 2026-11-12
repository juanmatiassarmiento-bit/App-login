import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import tema from '../utils/tema';

const ESTILO_MAPA = [
  { elementType: 'geometry', stylers: [{ color: '#EEF0E9' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#59665F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F7F6F0' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#D3DACE' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E2EADF' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D7E6D8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E0E4DC' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F4E9D8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CFE0E6' }] },
];

export default function StadiumMap({ center, markers, onMarkerPress, onLongPress, revision, showUserLocation, zoom }) {
  const region = useMemo(() => {
    const delta = zoom === 5 ? 8 : zoom >= 14 ? 0.035 : 0.06;
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: zoom === 5 ? 8 : delta,
      longitudeDelta: zoom === 5 ? 15 : delta,
    };
  }, [center.latitude, center.longitude, zoom]);

  return (
    <MapView
      customMapStyle={ESTILO_MAPA}
      initialRegion={region}
      key={revision}
      loadingBackgroundColor={tema.colors.mapBg}
      loadingEnabled
      loadingIndicatorColor={tema.colors.green}
      mapType="standard"
      moveOnMarkerPress={false}
      onLongPress={({ nativeEvent }) => onLongPress?.({ latitude: nativeEvent.coordinate.latitude, longitude: nativeEvent.coordinate.longitude })}
      showsBuildings={false}
      showsCompass={false}
      showsMyLocationButton={false}
      showsPointsOfInterest={false}
      showsTraffic={false}
      showsUserLocation={showUserLocation}
      showsVerticalScrollIndicator={false}
      style={StyleSheet.absoluteFill}
      toolbarEnabled={false}
    >
      {markers.map((marker) => {
        const esManual = Boolean(marker.lugar?.manual) || String(marker.lugar?.id || '').startsWith('lugar-');
        return (
          <Marker
            anchor={{ x: 0.5, y: 1 }}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            key={marker.id}
            onPress={() => onMarkerPress(marker.lugar)}
            tracksViewChanges={false}
            zIndex={1}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.markerBubble, esManual && styles.markerBubbleManual]}>
                <View style={[styles.markerDot, esManual && styles.markerDotManual]} />
              </View>
              <View style={[styles.markerTip, esManual && styles.markerTipManual]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerWrap: {
    width: 36,
    height: 48,
    alignItems: 'center',
  },
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderTopLeftRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.green,
    borderWidth: 2.5,
    borderColor: tema.colors.white,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#10231C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tema.colors.white,
    transform: [{ rotate: '-45deg' }],
  },
  markerTip: {
    width: 0,
    height: 0,
    marginTop: -4,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: tema.colors.green,
  },
  markerBubbleManual: {
    backgroundColor: tema.colors.error,
    shadowColor: '#4A0E0A',
  },
  markerDotManual: {
    backgroundColor: tema.colors.white,
  },
  markerTipManual: {
    borderTopColor: tema.colors.error,
  },
});
