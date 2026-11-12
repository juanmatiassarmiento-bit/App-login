import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { validarLogin } from '../utils/validaciones';
import tema from '../utils/tema';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const validationError = validarLogin({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
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
        <View style={styles.brandLine}>
          <View style={styles.brandIcon}><Ionicons color={tema.colors.white} name="navigate" size={19} /></View>
          <Text style={styles.brand}>PUNTO SUR</Text>
        </View>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>TU CIUDAD, A TU MANERA</Text>
          <Text style={styles.heading}>Volvé a tus lugares.</Text>
          <Text style={styles.subtitle}>Inicia sesión para ver el mapa y guardar tus propios puntos.</Text>
        </View>
        <View style={styles.form}>
          <InputField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Correo electrónico"
            onChangeText={setEmail}
            placeholder="nombre@correo.com"
            value={email}
          />
          <InputField
            autoCapitalize="none"
            label="Contraseña"
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
            value={password}
          />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <CustomButton loading={loading} onPress={handleLogin} title="Ingresar" />
          <View style={styles.registerLine}>
            <Text style={styles.registerText}>¿Todavía no tienes cuenta?</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.registerLink}>Crear cuenta</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.footer}>UN MAPA DE LUGARES QUE IMPORTAN</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tema.colors.paper },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 36 },
  panel: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: tema.colors.green, alignItems: 'center', justifyContent: 'center' },
  brand: { color: tema.colors.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1.4 },
  intro: { marginTop: 62, marginBottom: 30 },
  eyebrow: { color: tema.colors.coral, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  heading: { marginTop: 10, color: tema.colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '800' },
  subtitle: { maxWidth: 310, marginTop: 12, color: tema.colors.muted, fontSize: 15, lineHeight: 23 },
  form: { padding: 21, borderRadius: 10, backgroundColor: tema.colors.white, borderWidth: 1, borderColor: tema.colors.line },
  error: { marginTop: -4, marginBottom: 13, color: tema.colors.error, fontSize: 13, lineHeight: 18 },
  registerLine: { marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  registerText: { color: tema.colors.muted, fontSize: 13 },
  registerLink: { color: tema.colors.greenDark, fontSize: 13, fontWeight: '800' },
  footer: { marginTop: 42, textAlign: 'center', color: tema.colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});