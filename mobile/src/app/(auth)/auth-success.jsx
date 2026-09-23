import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Check } from 'lucide-react-native';

import { Colors, Spacing, FontSize, Radius } from '@/theme';
import AppText from '@/components/ui/AppText';
import { AuthBackground } from '@/features/auth/components';
import { selectCurrentUser } from '@/features/auth/authSlice';

/**
 * AuthSuccessScreen (Welcome Transition)
 *
 * Requirements:
 * 1. Screen fades into deep navy/black automotive backdrop.
 * 2. Animated checkmark springs into place with a subtle ambient cyan glow.
 * 3. Spacious, clean breathing room between animation and text.
 * 4. Short, premium greeting fades in:
 *    - "YOU'RE ALL SET"
 *    - "Welcome, <First Name>!"
 *    - "Your next spotless ride starts here."
 * 5. Smoothly navigates to the main app (/(tabs)) using router.replace.
 */

const NAV_DELAY_MS = 2500;

export default function AuthSuccessScreen() {
  const user = useSelector(selectCurrentUser);
  const navigated = useRef(false);

  // Animation shared values
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(16);

  useEffect(() => {
    // 1. Success Circle appears
    circleOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    circleScale.value = withSpring(1, { damping: 14, stiffness: 220 });

    // 2. Animated Checkmark springs in
    checkmarkScale.value = withDelay(
      220,
      withSpring(1, { damping: 12, stiffness: 280 }),
    );

    // 3. Glow pulse
    glowOpacity.value = withDelay(
      300,
      withSequence(
        withTiming(0.75, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(0.55, { duration: 400 }),
      ),
    );

    // 4. Welcome Text reveals
    textOpacity.value = withDelay(450, withTiming(1, { duration: 450 }));
    textTranslateY.value = withDelay(
      450,
      withSpring(0, { damping: 14, stiffness: 200 }),
    );

    // 5. Navigate to Home
    const timer = setTimeout(() => {
      if (!navigated.current) {
        navigated.current = true;
        router.replace('/(tabs)');
      }
    }, NAV_DELAY_MS);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const firstName = user?.fullname?.trim().split(' ')[0] || 'there';

  return (
    <AuthBackground overlayOpacity={0.88}>
      <View style={styles.container}>
        {/* Animated Brand Mark & Checkmark Section */}
        <View style={styles.markWrapper}>
          {/* Subtle Ambient Glow Ring */}
          <Animated.View style={[styles.glowRing, glowStyle]} />

          {/* Frosted Success Circle */}
          <Animated.View style={[styles.circle, circleStyle]}>
            <Animated.View style={checkmarkStyle}>
              <Check size={44} color={Colors.cyanBlue} strokeWidth={3.2} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Welcome Text Content with spacious breathing room */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          {/* Tagline Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <AppText variant="overline" color={Colors.cyanBlue} style={styles.badgeText}>
              YOU&apos;RE ALL SET
            </AppText>
          </View>

          {/* Welcome Greeting */}
          <AppText
            variant="h2"
            weight="bold"
            color={Colors.white}
            center
            style={styles.greetingTitle}
          >
            Welcome, {firstName}!
          </AppText>

          {/* Subtitle Message */}
          <AppText
            variant="body"
            color={Colors.textSecondary}
            center
            style={styles.subMessage}
          >
            Your next spotless ride starts here.
          </AppText>
        </Animated.View>

        {/* Bottom Brand Watermark */}
        <View style={styles.bottomBrand}>
          <AppText variant="overline" color="rgba(255, 255, 255, 0.3)" center>
            THE BLACK WASH · DOORSTEP DETAIL
          </AppText>
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  markWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  glowRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(0, 207, 255, 0.18)',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 8,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 25, 35, 0.85)',
    borderWidth: 2,
    borderColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  textBlock: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cyanBlue,
  },
  badgeText: {
    letterSpacing: 1.5,
    fontSize: FontSize.xs,
  },
  greetingTitle: {
    letterSpacing: -0.4,
  },
  subMessage: {
    marginTop: 2,
    lineHeight: 22,
    maxWidth: 280,
  },
  bottomBrand: {
    position: 'absolute',
    bottom: Spacing['3xl'],
  },
});
