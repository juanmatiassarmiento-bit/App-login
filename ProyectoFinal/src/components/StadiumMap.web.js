import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import tema from '../utils/tema';

export default function StadiumMap({ markers, onMarkerPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.title}>Estadios argentinos</Text>
        <Text style={styles.subtitle}>Selecciona un estadio para ver el detalle. El mapa interactivo está disponible en Expo Go móvil.</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={markers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onMarkerPress(item.lugar)} style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.coordinates}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: tema.colors.paper },
  notice: { padding: 14, borderRadius: 8, backgroundColor: tema.colors.mint },
  title: { color: tema.colors.ink, fontSize: 15, fontWeight: '800' },
  subtitle: { marginTop: 5, color: tema.colors.muted, fontSize: 12, lineHeight: 18 },
  list: { gap: 8, paddingTop: 10, paddingBottom: 8 },
  row: { padding: 12, borderWidth: 1, borderColor: tema.colors.line, borderRadius: 8, backgroundColor: tema.colors.white },
  name: { color: tema.colors.ink, fontSize: 14, fontWeight: '800' },
  description: { marginTop: 4, color: tema.colors.muted, fontSize: 12 },
  coordinates: { marginTop: 6, color: tema.colors.greenDark, fontSize: 11, fontWeight: '700' },
});