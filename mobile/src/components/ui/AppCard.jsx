import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing, Shadows } from '@/theme';

/**
 * AppCard — Dark surface container with optional variants.
 *
 * @param {'default'|'elevated'|'outlined'|'glass'} variant
 * @param {number|object} padding
 * @param {object} style
 */
const AppCard = ({
  variant = 'default',
  padding,
  children,
  style,
  ...rest
}) => {
  const cardPadding = padding !== undefined ? padding : Spacing.lg;

  const variantStyle = {
    default: styles.default,
    elevated: styles.elevated,
    outlined: styles.outlined,
    glass: styles.glass,
  }[variant] || styles.default;

  return (
    <View
      style={[
        styles.base,
        { padding: cardPadding },
        variantStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
  },
  default: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  glass: {
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.md,
  },
});

export default AppCard;
