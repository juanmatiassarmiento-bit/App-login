import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from './StackNavigator';
import TabNavigator from './TabNavigator';
import { useAuth } from '../context/AuthContext';
import tema from '../utils/tema';

const Drawer = createDrawerNavigator();

function PrivateNavigation() {
  return (
    <Drawer.Navigator
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
});