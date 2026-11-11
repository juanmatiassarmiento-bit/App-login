import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import tema from '../utils/tema';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Ingresar"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tema.colors.paper },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen component={LoginScreen} name="Ingresar" />
      <Stack.Screen component={RegisterScreen} name="Registro" />
    </Stack.Navigator>
  );
}