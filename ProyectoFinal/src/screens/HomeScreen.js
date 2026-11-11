import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import tema from '../utils/tema';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'viajero';

  const handleLogout = async () => {
    const result = await signOut();
    if (result.error) Alert.alert('No se pudo cerrar sesión', result.error);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PUNTO SUR  /  TU MAPA</Text>
          <Text style={styles.title}>Hola, {nombre}</Text>
        </View>
        <Pressable accessibilityLabel="Cerrar sesión" accessibilityRole="button" onPress={handleLogout} style={styles.logout}>
          <Ionicons color={tema.colors.ink} name="log-out-outline" size={21} />
        </Pressable>
      </View>
      <View style={styles.feature}>
        <View style={styles.featureTop}>
          <Text style={styles.featureIndex}>01 / EXPLORAR</Text>
          <Ionicons color={tema.colors.green} name="compass-outline" size={23} />
        </View>
        <Text style={styles.featureTitle}>Los lugares también cuentan historias.</Text>
        <Text style={styles.featureBody}>Abre el mapa, guarda tus rincones favoritos y acompáñalos con una nota o una foto.</Text>
        <CustomButton
          onPress={() => navigation.navigate('Mapa')}
          style={styles.mapButton}
          title="Ir al mapa"
          icon={<Ionicons color={tema.colors.white} name="arrow-forward" size={17} />}
        />
      </View>
      <View style={styles.noteRow}>
        <View style={styles.noteIcon}><Ionicons color={tema.colors.coral} name="bookmark-outline" size={19} /></View>
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>Tu colección, siempre a mano</Text>
          <Text style={styles.noteText}>Los puntos guardados en este dispositivo aparecen en la pestaña Mapa.</Text>
        </View>
      </View>
      <View style={styles.bottomRule} />
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 23, paddingTop: 24, paddingBottom: 18, backgroundColor: tema.colors.paper },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  eyebrow: { color: tema.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { marginTop: 8, color: tema.colors.ink, fontSize: 28, fontWeight: '800' },
  logout: { width: 42, height: 42, borderRadius: 8, backgroundColor: tema.colors.white, borderWidth: 1, borderColor: tema.colors.line, alignItems: 'center', justifyContent: 'center' },
  feature: { padding: 21, borderRadius: 10, backgroundColor: tema.colors.mint, borderWidth: 1, borderColor: '#D1E2D6' },
  featureTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureIndex: { color: tema.colors.greenDark, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  featureTitle: { maxWidth: 290, marginTop: 28, color: tema.colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  featureBody: { marginTop: 10, color: tema.colors.muted, fontSize: 14, lineHeight: 21 },
  mapButton: { alignSelf: 'flex-start', marginTop: 22, paddingHorizontal: 17 },
  noteRow: { marginTop: 23, paddingVertical: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: tema.colors.line },
  noteIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#F8E8E1', alignItems: 'center', justifyContent: 'center' },
  noteCopy: { flex: 1 },
  noteTitle: { color: tema.colors.ink, fontSize: 14, fontWeight: '800' },
  noteText: { marginTop: 5, color: tema.colors.muted, fontSize: 13, lineHeight: 19 },
  bottomRule: { flex: 1 },
  email: { color: tema.colors.muted, fontSize: 12 },
});