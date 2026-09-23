import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';

/**
 * AppErrorState — inline or full-state error display.
 *
 * @param {string} title
 * @param {string} message
 * @param {string} retryLabel
 * @param {Function} onRetry
 */
const AppErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.iconContainer}>
      <AppText style={styles.icon}>⚠️</AppText>
    </View>
    <AppText variant="h4" weight="bold" center style={styles.title}>
      {title}
    </AppText>
    {message && (
      <AppText variant="bodySmall" color={Colors.textSecondary} center style={styles.message}>
        {message}
      </AppText>
    )}
    {onRetry && (
      <AppButton variant="outline" size="sm" onPress={onRetry} style={styles.button}>
        {retryLabel}
      </AppButton>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    marginTop: 2,
  },
  message: {
    marginTop: 2,
    maxWidth: 260,
    lineHeight: 18,
  },
  button: {
    marginTop: Spacing.sm,
  },
});

export default AppErrorState;
