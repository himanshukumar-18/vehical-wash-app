import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from './AppText';

/**
 * AppButton — primary interactive button.
 *
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'dark'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {Function} onPress
 */

const variantStyles = {
  primary: {
    bg: Colors.cyanBlue,
    text: Colors.primaryBlack,
    borderColor: 'transparent',
  },
  secondary: {
    bg: Colors.electricBlue,
    text: Colors.white,
    borderColor: 'transparent',
  },
  outline: {
    bg: 'transparent',
    text: Colors.cyanBlue,
    borderColor: Colors.cyanBlue,
  },
  ghost: {
    bg: 'transparent',
    text: Colors.textSecondary,
    borderColor: 'transparent',
  },
  dark: {
    bg: Colors.surfaceElevated,
    text: Colors.textPrimary,
    borderColor: Colors.border,
  },
  danger: {
    bg: Colors.error,
    text: Colors.white,
    borderColor: 'transparent',
  },
};

const sizeStyles = {
  sm: { height: 32, paddingHorizontal: Spacing.sm, fontSize: 12 },
  md: { height: 42, paddingHorizontal: Spacing.lg, fontSize: 14 },
  lg: { height: 48, paddingHorizontal: Spacing.xl, fontSize: 15 },
};

const AppButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  style,
  ...rest
}) => {
  const vs = variantStyles[variant] || variantStyles.primary;
  const ss = sizeStyles[size] || sizeStyles.md;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          borderColor: vs.borderColor,
          height: ss.height,
          paddingHorizontal: ss.paddingHorizontal,
        },
        (variant === 'outline' || variant === 'dark') && styles.outlined,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && Shadows.cyanGlow,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={vs.text}
          accessibilityLabel="Loading"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <AppText
            weight="semiBold"
            style={[
              styles.label,
              {
                color: isDisabled ? Colors.textDisabled : vs.text,
                fontSize: ss.fontSize,
              },
            ]}
          >
            {children}
          </AppText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    flexDirection: 'row',
  },
  outlined: {
    borderWidth: 1,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});

export default AppButton;
