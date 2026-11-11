import React from 'react';
import { Modal as NativeModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tema from '../utils/tema';

export default function Modal({ visible, title, onClose, children, footer }) {
  return (
    <NativeModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel="Cerrar ventana" accessibilityRole="button" onPress={onClose} style={styles.close}>
              <Ionicons color={tema.colors.ink} name="close" size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 32, 27, 0.42)' },
  sheet: {
    maxHeight: '90%',
    paddingTop: 18,
    paddingBottom: 22,
    backgroundColor: tema.colors.paper,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heading: {
    minHeight: 52,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: tema.colors.line,
  },
  title: { color: tema.colors.ink, fontSize: 19, fontWeight: '800' },
  close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 },
  footer: { paddingHorizontal: 22, paddingTop: 10, gap: 9 },
});