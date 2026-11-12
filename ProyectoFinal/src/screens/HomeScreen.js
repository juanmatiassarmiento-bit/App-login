import React from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ESTADIOS_INICIALES } from '../data/estadios';
import { resolverImagen } from '../utils/imagenes';
import tema from '../utils/tema';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  const { user, signOut } = useAuth();
  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'viajero';

  const handleLogout = async () => {
    const result = await signOut();
    if (result.error) Alert.alert('No se pudo cerrar sesión', result.error);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <View style={styles.panel}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PUNTO SUR  /  TU MAPA</Text>
            <Text style={styles.title}>Hola, {nombre}</Text>
          </View>
          <Pressable
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
            onPress={handleLogout}
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <Ionicons color={tema.colors.ink} name="log-out-outline" size={21} />
          </Pressable>
        </View>

        <ImageBackground
          imageStyle={styles.heroImage}
          source={resolverImagen('monumental')}
          style={styles.hero}
        >
          <View style={styles.heroShade} />

          <View style={styles.heroTop}>
            <View style={styles.heroTag}>
              <Ionicons color={tema.colors.gold} name="compass-outline" size={14} />
              <Text style={styles.heroTagText}>EXPLORAR</Text>
            </View>
            <View style={styles.heroCount}>
              <Text style={styles.heroCountValue}>{ESTADIOS_INICIALES.length}</Text>
              <Text style={styles.heroCountLabel}>estadios</Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>Los estadios también cuentan historias.</Text>
            <Text style={styles.heroBody}>
              Abrí el mapa, guardá tus canchas favoritas y sumá una foto o una nota.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Mapa')}
              style={({ pressed }) => [styles.heroButton, pressed && styles.heroButtonPressed]}
            >
              <Text style={styles.heroButtonLabel}>Ir al mapa</Text>
              <Ionicons color={tema.colors.greenDark} name="arrow-forward" size={16} />
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{ESTADIOS_INICIALES.length}</Text>
            <Text style={styles.statLabel}>estadios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>plataformas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statIconRow}>
              <Text style={styles.statValue}>Suri</Text>
              <Ionicons color={tema.colors.gold} name="sparkles" size={12} />
            </View>
            <Text style={styles.statLabel}>tu asistente</Text>
          </View>
        </View>

        <View style={styles.noteRow}>
          <View style={styles.noteIcon}>
            <Ionicons color={tema.colors.coral} name="bookmark-outline" size={19} />
          </View>
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle}>Tu colección, siempre a mano</Text>
            <Text style={styles.noteText}>
              Los puntos guardados aparecen en la pestaña Mapa, también cuando abrís la app en la web.
            </Text>
          </View>
        </View>

        <View style={styles.bottomRule} />
        <Text style={styles.email}>{user?.email}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tema.colors.paper,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 24,
    paddingBottom: 22,
  },
  scrollWide: {
    paddingHorizontal: 40,
    paddingTop: 38,
    paddingBottom: 34,
  },
  panel: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    color: tema.colors.coral,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: 7,
    color: tema.colors.ink,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logout: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.white,
  },
  logoutPressed: {
    backgroundColor: tema.colors.mint,
  },
  hero: {
    minHeight: 308,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: tema.colors.greenDark,
  },
  heroImage: {
    borderRadius: 22,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 34, 27, 0.56)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroTagText: {
    color: tema.colors.white,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  heroCount: {
    alignItems: 'flex-end',
  },
  heroCountValue: {
    color: tema.colors.white,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroCountLabel: {
    marginTop: -2,
    color: 'rgba(255, 255, 255, 0.66)',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroBottom: {
    maxWidth: 430,
  },
  heroTitle: {
    color: tema.colors.white,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroBody: {
    marginTop: 9,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13.5,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 17,
    minHeight: 43,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: tema.colors.gold,
  },
  heroButtonPressed: {
    opacity: 0.86,
  },
  heroButtonLabel: {
    color: tema.colors.greenDark,
    fontSize: 13.5,
    fontWeight: '800',
  },
  statsRow: {
    marginTop: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tema.colors.line,
    backgroundColor: tema.colors.cream,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: tema.colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    marginTop: 3,
    color: tema.colors.muted,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: tema.colors.line,
  },
  noteRow: {
    marginTop: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tema.colors.line,
  },
  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.coralSoft,
  },
  noteCopy: {
    flex: 1,
  },
  noteTitle: {
    color: tema.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  noteText: {
    marginTop: 5,
    color: tema.colors.muted,
    fontSize: 12.5,
    lineHeight: 19,
  },
  bottomRule: {
    height: 24,
  },
  email: {
    color: tema.colors.muted,
    fontSize: 11,
  },
});
