import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/theme';
import AppText from '@/components/ui/AppText';

/**
 * AuthHeader
 *
 * Clean branded header for authentication screens:
 * - Brand mark tag ("THE BLACK WASH · DOORSTEP CARE")
 * - Screen Title (e.g. "Welcome Back", "Create Account", "Verify Your Email")
 * - Subtitle description with Poppins typography
 */
const AuthHeader = ({
  badge = 'THE BLACK WASH',
  title,
  subtitle,
  center = false,
  style,
}) => {
  return (
    <View style={[styles.container, center && styles.centered, style]}>
      {/* Brand Badge */}
      <View style={[styles.badge, center && styles.badgeCentered]}>
        <View style={styles.badgeDot} />
        <AppText variant="overline" color={Colors.cyanBlue} style={styles.badgeText}>
          {badge}
        </AppText>
      </View>

      {/* Screen Title */}
      <AppText
        variant="h2"
        weight="bold"
        color={Colors.white}
        center={center}
        style={styles.title}
      >
        {title}
      </AppText>

      {/* Screen Subtitle */}
      {subtitle && (
        <AppText
          variant="bodySmall"
          color={Colors.textSecondary}
          center={center}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 2,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  centered: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  badgeCentered: {
    alignSelf: 'center',
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.cyanBlue,
  },
  badgeText: {
    letterSpacing: 1.2,
    fontSize: 9,
  },
  title: {
    marginTop: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 18,
  },
});

export default AuthHeader;
