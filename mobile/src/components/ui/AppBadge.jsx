import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors, Spacing, Radius } from '@/theme';
import AppText from './AppText';

/**
 * AppBadge — status badge with color pill styling and Poppins typography.
 *
 * @param {'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'|'success'|'warning'|'error'|'info'|'neutral'} variant
 * @param {string} label
 * @param {'sm'|'md'} size
 * @param {React.ReactNode} leftIcon
 */

const BADGE_THEMES = {
  pending: {
    bg: Colors.warningLight,
    text: Colors.warning,
    border: 'rgba(217, 119, 6, 0.25)',
    label: 'Pending',
  },
  confirmed: {
    bg: Colors.infoLight,
    text: Colors.info,
    border: 'rgba(2, 132, 199, 0.25)',
    label: 'Confirmed',
  },
  in_progress: {
    bg: 'rgba(0, 207, 255, 0.15)',
    text: Colors.cyanBlue,
    border: 'rgba(0, 207, 255, 0.35)',
    label: 'In Progress',
  },
  completed: {
    bg: Colors.successLight,
    text: Colors.success,
    border: 'rgba(22, 163, 74, 0.25)',
    label: 'Completed',
  },
  cancelled: {
    bg: Colors.errorLight,
    text: Colors.error,
    border: 'rgba(220, 38, 38, 0.25)',
    label: 'Cancelled',
  },
  success: {
    bg: Colors.successLight,
    text: Colors.success,
    border: 'rgba(22, 163, 74, 0.25)',
  },
  warning: {
    bg: Colors.warningLight,
    text: Colors.warning,
    border: 'rgba(217, 119, 6, 0.25)',
  },
  error: {
    bg: Colors.errorLight,
    text: Colors.error,
    border: 'rgba(220, 38, 38, 0.25)',
  },
  info: {
    bg: Colors.infoLight,
    text: Colors.info,
    border: 'rgba(2, 132, 199, 0.25)',
  },
  neutral: {
    bg: Colors.background,
    text: Colors.textSecondary,
    border: Colors.border,
  },
};

const AppBadge = ({
  variant = 'neutral',
  label,
  size = 'md',
  leftIcon,
  style,
}) => {
  const theme = BADGE_THEMES[variant] || BADGE_THEMES.neutral;
  const displayText = label || theme.label || variant;

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
      <AppText
        variant="caption"
        weight="semiBold"
        style={[
          styles.text,
          { color: theme.text },
          size === 'sm' && styles.textSm,
        ]}
      >
        {displayText}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: 10,
    lineHeight: 14,
  },
  icon: {
    marginRight: 4,
  },
});

export default AppBadge;
