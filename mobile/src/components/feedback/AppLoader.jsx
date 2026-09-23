import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/theme';
import AppText from '@/components/ui/AppText';

/**
 * AppLoader — centered loading spinner.
 *
 * @param {'small'|'large'} size
 * @param {string} color
 * @param {string} text — optional loading message
 * @param {boolean} overlay — fill entire screen with semi-transparent background
 */
const AppLoader = ({
  size = 'large',
  color = Colors.cyanBlue,
  text,
  overlay = false,
  style,
}) => (
  <View style={[styles.container, overlay && styles.overlay, style]}>
    <ActivityIndicator size={size} color={color} />
    {text && (
      <AppText
        variant="caption"
        color={overlay ? Colors.white : Colors.textSecondary}
        style={styles.text}
      >
        {text}
      </AppText>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayDark,
    zIndex: 999,
  },
  text: {
    marginTop: Spacing.xs,
  },
});

export default AppLoader;
