import React from 'react';
import {
  KeyboardAvoidingView, Modal as NativeModal, Platform, Pressable, ScrollView,
  StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tema from '../utils/tema';

export default function Modal({ visible, title, subtitle, onClose, children, footer }) {
  const wide = useWindowDimensions().width >= 760;
  return (
    <NativeModal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[styles.backdrop, wide && styles.backdropWide]}>
        <Pressable accessibilityLabel="Cerrar" onPress={onClose} style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.wrap, wide && styles.wrapWide]}>
          <View style={[styles.sheet, wide && styles.sheetWide]}>
            {!wide && <View style={styles.grabber} />}
            <View style={styles.heading}>
              <View style={styles.headingCopy}>
                <Text numberOfLines={2} style={styles.title}>{title}</Text>
                {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
                <Ionicons color={tema.colors.ink} name="close" size={20} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.scroll}>
              {children}
            </ScrollView>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: tema.colors.overlay },
  backdropWide: { alignItems: 'center', justifyContent: 'center', padding: 26 },
  wrap: { width: '100%', maxHeight: '92%' },
  wrapWide: { maxWidth: 560 },
  sheet: {
    maxHeight: '100%', paddingTop: 10, paddingBottom: 18,
    backgroundColor: tema.colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  sheetWide: { paddingTop: 0, paddingBottom: 20, borderRadius: 24 },
  grabber: { width: 40, height: 5, alignSelf: 'center', marginBottom: 8, borderRadius: 3, backgroundColor: tema.colors.lineDark },
  heading: { minHeight: 60, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: tema.colors.line },
  headingCopy: { flex: 1, paddingVertical: 12 },
  title: { color: tema.colors.ink, fontSize: 19, fontWeight: '800' },
  subtitle: { marginTop: 3, color: tema.colors.muted, fontSize: 12, fontWeight: '600' },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: tema.colors.white, borderWidth: 1, borderColor: tema.colors.line },
  scroll: { flexShrink: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 9, borderTopWidth: 1, borderTopColor: tema.colors.line },
});
