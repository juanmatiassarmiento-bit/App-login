import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import tema from '../utils/tema';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tema.colors.greenDark,
        tabBarInactiveTintColor: tema.colors.muted,
        tabBarStyle: { height: 62, paddingTop: 5, paddingBottom: 7, borderTopColor: tema.colors.line, backgroundColor: tema.colors.white },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={route.name === 'Mapa' ? 'map-outline' : 'home-outline'} size={size} />
        ),
      })}
    >
      <Tab.Screen component={HomeScreen} name="Inicio" />
      <Tab.Screen component={MapScreen} name="Mapa" />
    </Tab.Navigator>
  );
}