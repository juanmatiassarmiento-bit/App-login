import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { validarRegistro } from '../utils/validaciones';
import tema from '../utils/tema';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const validationError = validarRegistro({ nombre, email, password, confirmacion });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signUp(nombre, email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.confirmationRequired) {
        Alert.alert('Revisa tu correo', 'Supabase envió un enlace para confirmar la cuenta antes de iniciar sesión.');
        navigation.navigate('Ingresar');
      }
    } catch {
      setError('No se pudo conectar. Revisa tu conexión e inténtalo otra vez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backLabel}>‹  Volver</Text>
        </Pressable>
        <Text style={styles.eyebrow}>UN BUEN LUGAR PARA EMPEZAR</Text>
        <Text style={styles.heading}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Guarda sitios, recuerdos y rincones para volver.</Text>
        <View style={styles.form}>
          <InputField autoCapitalize="words" label="Nombre de usuario" onChangeText={setNombre} placeholder="Tu nombre" value={nombre} />
          <InputField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Correo electrónico"
            onChangeText={setEmail}
            placeholder="nombre@correo.com"
            value={email}
          />
          <InputField label="Contraseña" onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry value={password} />
          <InputField label="Repite la contraseña" onChangeText={setConfirmacion} placeholder="Confirma tu contraseña" secureTextEntry value={confirmacion} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <CustomButton loading={loading} onPress={handleRegister} title="Crear cuenta" />
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Ingresar')} style={styles.loginLink}>
            <Text style={styles.loginText}>Ya tengo cuenta · Iniciar sesión</Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tema.colors.paper },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25, paddingVertical: 24 },
  panel: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: 30, paddingVertical: 8, paddingRight: 12 },
  backLabel: { color: tema.colors.greenDark, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: tema.colors.coral, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heading: { marginTop: 9, color: tema.colors.ink, fontSize: 32, fontWeight: '800' },
  subtitle: { marginTop: 9, marginBottom: 22, color: tema.colors.muted, fontSize: 14, lineHeight: 21 },
  form: { padding: 20, borderRadius: 10, backgroundColor: tema.colors.white, borderWidth: 1, borderColor: tema.colors.line },
  error: { marginTop: -5, marginBottom: 13, color: tema.colors.error, fontSize: 13, lineHeight: 18 },
  loginLink: { alignItems: 'center', paddingTop: 18 },
  loginText: { color: tema.colors.greenDark, fontSize: 13, fontWeight: '700' },
});