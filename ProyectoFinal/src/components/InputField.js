import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import tema from '../utils/tema';

export default function InputField({ label, error, style, multiline = false, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        autoCorrect={false}
        placeholderTextColor="#97A19B"
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 17 },
  label: { color: tema.colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: tema.colors.line,
    borderRadius: 7,
    backgroundColor: tema.colors.white,
    color: tema.colors.ink,
    fontSize: 15,
  },
  multiline: { minHeight: 96, paddingTop: 13 },
  inputError: { borderColor: tema.colors.error },
  error: { marginTop: 5, color: tema.colors.error, fontSize: 12 },
});