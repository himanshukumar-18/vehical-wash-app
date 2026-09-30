import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/theme';
import AppText from '@/components/ui/AppText';

/**
 * AuthHeader
 *
 * Premium branded header for authentication screens:
 * - Rounded bottom corners matching Home & Me headers (borderBottomLeftRadius: 28, borderBottomRightRadius: 28)
 * - Subtle automotive wave watermark background matching Me & Home headers
 * - Brand badge chip with glowing cyan accent
 * - Optional back button matching circular action button design
 * - Bold headline & subtitle typography
 */
const AuthHeader = ({
  badge = 'THE BLACK WASH · DOORSTEP CARE',
  title,
  subtitle,
  center = false,
  showBack = false,
  onBack,
  rightElement,
  style,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.headerContainer, style]}>
      {/* Subtle Automotive Wave Watermark in Background matching Me header */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Svg width={width} height="130" viewBox="0 0 375 130" fill="none">
          <Path
            d="M-20 65 C 80 15, 180 120, 300 45 C 360 5, 400 35, 420 50"
            stroke={Colors.cyanBlue}
            strokeWidth="2.5"
            strokeOpacity="0.07"
          />
          <Path
            d="M-10 85 C 90 35, 190 130, 310 65 C 370 25, 410 55, 430 70"
            stroke={Colors.electricBlue}
            strokeWidth="1.5"
            strokeOpacity="0.05"
          />
        </Svg>
      </View>

      {/* Top Action / Badge Bar */}
      <View style={[styles.topRow, center && !showBack && !rightElement && styles.topRowCenter]}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backCircleBtn}
            onPress={onBack}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={16} color={Colors.cyanBlue} />
          </TouchableOpacity>
        ) : null}

        {/* Brand Badge Chip */}
        <View style={[styles.badge, center && !showBack && !rightElement && styles.badgeCenter]}>
          <View style={styles.badgeDot} />
          <AppText variant="overline" color={Colors.cyanBlue} style={styles.badgeText}>
            {badge}
          </AppText>
        </View>

        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : showBack ? (
          <View style={styles.rightPlaceholder} />
        ) : (
          <View style={styles.sparkleIconBox}>
            <Sparkles size={14} color={Colors.cyanBlue} />
          </View>
        )}
      </View>

      {/* Headline & Subtitle */}
      <View style={[styles.textBlock, center && styles.textBlockCenter]}>
        <AppText
          variant="h2"
          weight="bold"
          color={Colors.textPrimary}
          center={center}
          style={styles.title}
        >
          {title}
        </AppText>

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
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.deepNavy,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  topRowCenter: {
    justifyContent: 'center',
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    alignSelf: 'center',
  },
  badgeCenter: {
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
  sparkleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  rightPlaceholder: {
    width: 36,
  },
  textBlock: {
    gap: 4,
  },
  textBlockCenter: {
    alignItems: 'center',
  },
  title: {
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 18,
  },
});

export default AuthHeader;
