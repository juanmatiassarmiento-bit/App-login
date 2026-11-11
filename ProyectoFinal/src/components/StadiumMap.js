import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import tema from '../utils/tema';

export default function StadiumMap({ center, markers, onMarkerPress, revision, showUserLocation, zoom }) {
  const markerComponents = [];
  for (const marker of markers) {
    markerComponents.push(
      <Marker
        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
        key={marker.id}
        onPress={() => onMarkerPress(marker.lugar)}
      >
        <View style={styles.markerContainer}>
          {marker.lugar.image ? (
            <Image source={{ uri: marker.lugar.image }} style={styles.markerImage} />
          ) : (
            <View style={[styles.markerImage, { backgroundColor: tema.colors.green, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="location" size={20} color="white" />
            </View>
          )}
          <View style={styles.markerPointer} />
        </View>
      </Marker>,
    );
  }

  return (
    <MapView
      initialRegion={{
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: zoom === 5 ? 8 : 0.06,
        longitudeDelta: zoom === 5 ? 15 : 0.06,
      }}
      key={revision}
      showsUserLocation={showUserLocation}
      style={StyleSheet.absoluteFill}
      showsVerticalScrollIndicator={false}
    >
      {markerComponents}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
});