import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Modal as NativeModal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tema from '../utils/tema';
import { SUGERENCIAS_ASISTENTE, responderAsistente, saludoInicial } from '../utils/asistente';

function MensajeAnim({ children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [a]);
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function Puntos() {
  const uno = useRef(new Animated.Value(0.25)).current;
  const dos = useRef(new Animated.Value(0.25)).current;
  const tres = useRef(new Animated.Value(0.25)).current;
  const dots = useMemo(() => [uno, dos, tres], [uno, dos, tres]);
  useEffect(() => {
    const anims = dots.map((d, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 150),
      Animated.timing(d, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(d, { toValue: 0.25, duration: 260, useNativeDriver: true }),
    ])));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);
  return <View style={styles.typing}>{dots.map((o, i) => <Animated.View key={i} style={[styles.dot, { opacity: o }]} />)}</View>;
}

export default function AssistantModal({ visible, onClose, lugares = [], onVerEstadio }) {
  const { width, height } = useWindowDimensions();
  const wide = width >= 760;
  const [mensajes, setMensajes] = useState([{ id: 'bienvenida', role: 'bot', text: saludoInicial() }]);
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const scroll = useRef(null);
  const timer = useRef(null);
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (visible) {
      entrada.setValue(0);
      Animated.spring(entrada, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
    }
  }, [entrada, visible]);

  const enviar = useCallback((sugerencia) => {
    const contenido = (sugerencia ?? texto).trim();
    if (!contenido || escribiendo) return;
    setTexto('');
    setMensajes((prev) => [...prev, { id: `u${prev.length}`, role: 'user', text: contenido }]);
    setEscribiendo(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMensajes((prev) => [...prev, { id: `b${prev.length}`, role: 'bot', ...responderAsistente(contenido, lugares) }]);
      setEscribiendo(false);
      requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
    }, 600);
    requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
  }, [escribiendo, lugares, texto]);

  return (
    <NativeModal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={[styles.backdrop, wide && styles.backdropWide]}>
        <Pressable accessibilityLabel="Cerrar asistente" onPress={onClose} style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
          <Animated.View style={[styles.sheet, wide ? [styles.sheetWide, { height: Math.min(640, height - 60) }] : styles.sheetMobile, { opacity: entrada, transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}>
            <View style={styles.header}>
              <View style={styles.orb} />
              <View style={styles.avatar}><Ionicons color={tema.colors.gold} name="sparkles" size={20} /></View>
              <View style={styles.headerCopy}>
                <Text style={styles.headerTitle}>Suri</Text>
                <Text style={styles.headerSub}>Asistente de Punto Sur</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.headerBtn}>
                <Ionicons color={tema.colors.white} name="close" size={18} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} ref={scroll}>
              {mensajes.map((m) => (m.role === 'user' ? (
                <MensajeAnim key={m.id}>
                  <View style={styles.userRow}>
                    <View style={styles.userBubble}><Text style={styles.userText}>{m.text}</Text></View>
                  </View>
                </MensajeAnim>
              ) : (
                <MensajeAnim key={m.id}>
                  <View style={styles.botRow}>
                    <View style={styles.botAvatar}><Ionicons color={tema.colors.white} name="sparkles" size={13} /></View>
                    <View style={styles.botBubble}>
                      <Text style={styles.botText}>{m.text}</Text>
                      {m.action && (
                        <Pressable accessibilityRole="button" onPress={() => { onClose(); setTimeout(() => onVerEstadio?.(m.action.lugar), 180); }} style={styles.action}>
                          <Ionicons color={tema.colors.greenDark} name="map-outline" size={14} />
                          <Text style={styles.actionLabel}>{m.action.label}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </MensajeAnim>
              )))}
              {escribiendo && (
                <View style={styles.botRow}>
                  <View style={styles.botAvatar}><Ionicons color={tema.colors.white} name="sparkles" size={13} /></View>
                  <View style={[styles.botBubble, styles.botBubbleTyping]}><Puntos /></View>
                </View>
              )}
            </ScrollView>

            <View style={styles.chips}>
              {SUGERENCIAS_ASISTENTE.map((s) => (
                <Pressable key={s.label} accessibilityRole="button" onPress={() => enviar(s.prompt)} style={styles.chip}>
                  <Ionicons color={tema.colors.greenDark} name={s.icon} size={13} />
                  <Text style={styles.chipLabel}>{s.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                accessibilityLabel="Mensaje para Suri"
                autoCorrect={false}
                blurOnSubmit={false}
                onChangeText={setTexto}
                onSubmitEditing={() => enviar()}
                placeholder="Escribile a Suri…"
                placeholderTextColor="#93A099"
                returnKeyType="send"
                style={styles.input}
                value={texto}
              />
              <Pressable accessibilityRole="button" disabled={!texto.trim() || escribiendo} onPress={() => enviar()} style={[styles.send, (!texto.trim() || escribiendo) && styles.sendOff]}>
                <Ionicons color={tema.colors.white} name="arrow-up" size={19} />
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14, 27, 22, 0.55)' },
  backdropWide: { alignItems: 'center', justifyContent: 'center', padding: 28 },
  wrap: { width: '100%' },
  sheet: { overflow: 'hidden', backgroundColor: tema.colors.paper, elevation: 20, shadowColor: '#08140F', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 18 } },
  sheetMobile: { height: '86%', borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  sheetWide: { maxWidth: 500, alignSelf: 'center', borderRadius: 26 },
  header: { minHeight: 78, paddingHorizontal: 15, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: tema.colors.greenDark },
  orb: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -90, right: -30, backgroundColor: 'rgba(226, 174, 85, 0.14)' },
  avatar: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.12)' },
  headerCopy: { flex: 1 },
  headerTitle: { color: tema.colors.white, fontSize: 19, fontWeight: '800' },
  headerSub: { marginTop: 3, color: 'rgba(255, 255, 255, 0.72)', fontSize: 11, fontWeight: '600' },
  headerBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.12)' },
  chat: { flexGrow: 1, paddingHorizontal: 15, paddingTop: 16, paddingBottom: 8, gap: 11 },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, paddingRight: 30 },
  botAvatar: { width: 27, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: tema.colors.green },
  botBubble: { flexShrink: 1, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 15, borderBottomLeftRadius: 5, backgroundColor: tema.colors.white, borderWidth: 1, borderColor: tema.colors.line },
  botBubbleTyping: { paddingVertical: 13 },
  botText: { color: tema.colors.inkSoft, fontSize: 13.5, lineHeight: 19 },
  userRow: { alignItems: 'flex-end', paddingLeft: 40 },
  userBubble: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 15, borderBottomRightRadius: 5, backgroundColor: tema.colors.green },
  userText: { color: tema.colors.white, fontSize: 13.5, fontWeight: '600' },
  action: { alignSelf: 'flex-start', marginTop: 9, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, backgroundColor: tema.colors.mint },
  actionLabel: { color: tema.colors.greenDark, fontSize: 12, fontWeight: '800' },
  typing: { paddingVertical: 2, flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tema.colors.green },
  chips: { paddingHorizontal: 14, paddingVertical: 9, gap: 7, flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: tema.colors.line, backgroundColor: tema.colors.cream },
  chip: { paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 18, borderWidth: 1, borderColor: tema.colors.lineDark, backgroundColor: tema.colors.white },
  chipLabel: { color: tema.colors.greenDark, fontSize: 11.5, fontWeight: '700' },
  inputRow: { paddingHorizontal: 13, paddingTop: 9, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: tema.colors.cream, borderTopWidth: 1, borderTopColor: tema.colors.line },
  input: { flex: 1, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: tema.colors.lineDark, backgroundColor: tema.colors.white, color: tema.colors.ink, fontSize: 14 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: tema.colors.green },
  sendOff: { backgroundColor: tema.colors.lineDark },
});
