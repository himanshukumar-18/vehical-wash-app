import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';

/**
 * AppEmptyState — displayed when a list or section has no content.
 *
 * @param {string} title
 * @param {string} message
 * @param {string} actionLabel
 * @param {Function} onAction
 * @param {string} emoji — optional emoji icon
 */
const AppEmptyState = ({
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  emoji = '📋',
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.iconContainer}>
      <AppText style={styles.icon}>{emoji}</AppText>
    </View>
    <AppText variant="h4" weight="bold" center style={styles.title}>
      {title}
    </AppText>
    {message && (
      <AppText variant="bodySmall" color={Colors.textSecondary} center style={styles.message}>
        {message}
      </AppText>
    )}
    {actionLabel && onAction && (
      <AppButton variant="primary" size="md" onPress={onAction} style={styles.button}>
        {actionLabel}
      </AppButton>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 40,
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
    marginTop: Spacing.md,
  },
});

export default AppEmptyState;
