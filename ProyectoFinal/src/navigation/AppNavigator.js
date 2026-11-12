import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import TabNavigator from './TabNavigator';
import { useAuth } from '../context/AuthContext';
import tema from '../utils/tema';

const Drawer = createDrawerNavigator();

function ContenidoDrawer(props) {
  const { signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawer}>
      <DrawerItemList {...props} />
      <View style={styles.separador} />
      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          const result = await signOut();
          if (result.error) Alert.alert('No se pudo cerrar sesión', result.error);
        }}
        style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
      >
        <Ionicons color={tema.colors.error} name="log-out-outline" size={19} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

function PrivateNavigation() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <ContenidoDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: tema.colors.paper },
        headerTintColor: tema.colors.ink,
        headerTitleStyle: { fontSize: 16, fontWeight: '800' },
        drawerActiveTintColor: tema.colors.greenDark,
        drawerActiveBackgroundColor: tema.colors.mint,
        drawerLabelStyle: { fontWeight: '700' },
        drawerType: 'front',
      }}
    >
      <Drawer.Screen component={TabNavigator} name="Explorar" options={{ title: 'Punto Sur' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={tema.colors.green} size="large" /></View>;
  }

  return (
    <NavigationContainer>
      {user ? <PrivateNavigation /> : <StackNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tema.colors.paper },
  drawer: { paddingTop: 10 },
  separador: { height: 1, marginHorizontal: 14, marginVertical: 10, backgroundColor: tema.colors.line },
  logout: {
    minHeight: 46,
    marginHorizontal: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
  },
  logoutPressed: { backgroundColor: '#F8E5E2' },
  logoutText: { color: tema.colors.error, fontSize: 14, fontWeight: '800' },
});
