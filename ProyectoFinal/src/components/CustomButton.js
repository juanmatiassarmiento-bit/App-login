import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import tema from '../utils/tema';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}) {
  const secondary = variant === 'secondary';
  const quiet = variant === 'quiet';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        quiet && styles.quiet,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary || quiet ? tema.colors.greenDark : tema.colors.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, (secondary || quiet) && styles.secondaryLabel]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: tema.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  secondary: { backgroundColor: tema.colors.mint },
  quiet: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82 },
  label: { color: tema.colors.white, fontSize: 15, fontWeight: '700' },
  secondaryLabel: { color: tema.colors.greenDark },
});