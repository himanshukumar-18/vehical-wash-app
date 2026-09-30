import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, Droplets, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';

import { Colors, Spacing, Radius, FontSize } from '@/theme';
import AppText from '@/components/ui/AppText';
import { selectCurrentUser } from '@/features/auth/authSlice';

const AUTO_NAV_MS = 2800;

/**
 * AuthSuccessScreen
 *
 * Cinematic automotive "From Water Splash to Fresh Shine" success experience:
 * - Step 1: Ambient cyan glow & car silhouette reveal
 * - Step 2: Animated water-sweep & floating droplet spray accents
 * - Step 3: High-gloss clean shine beam sweep
 * - Step 4: Cyan success ring confirmation & sparkles
 * - Step 5: Context-aware typography & 1-tap "Continue to Home" CTA
 */
export default function AuthSuccessScreen() {
  const params = useLocalSearchParams();
  const user = useSelector(selectCurrentUser);
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;
  const navigated = useRef(false);

  // Animation shared values
  const bgGlowScale = useSharedValue(0.6);
  const bgGlowOpacity = useSharedValue(0);
  const carBadgeScale = useSharedValue(0.5);
  const carBadgeOpacity = useSharedValue(0);
  const waterSweep = useSharedValue(-120);
  const shineSweep = useSharedValue(-120);
  const dropletOpacity = useSharedValue(0);
  const dropletTranslateY = useSharedValue(10);
  const sparkleScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.92);
  const progressWidth = useSharedValue(0);

  const navigateToHome = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace('/(tabs)');
  }, []);

  useEffect(() => {
    // 1. Ambient Glow pulse in
    bgGlowOpacity.value = withTiming(0.85, { duration: 600, easing: Easing.out(Easing.cubic) });
    bgGlowScale.value = withTiming(1.15, { duration: 800, easing: Easing.out(Easing.cubic) });

    // 2. Central Car Badge Reveal
    carBadgeOpacity.value = withDelay(
      150,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    carBadgeScale.value = withDelay(
      150,
      withSpring(1, { damping: 13, stiffness: 220 })
    );

    // 3. Water-Sweep & Droplets Splash across car
    waterSweep.value = withDelay(
      350,
      withTiming(120, { duration: 750, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    dropletOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 400 }),
      )
    );
    dropletTranslateY.value = withDelay(
      400,
      withTiming(-12, { duration: 700, easing: Easing.out(Easing.cubic) })
    );

    // 4. High-Gloss Shine Sweep & Sparkles
    shineSweep.value = withDelay(
      850,
      withTiming(120, { duration: 650, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    sparkleScale.value = withDelay(
      950,
      withSpring(1, { damping: 11, stiffness: 260 })
    );

    // 5. Success Heading & Copy reveal
    textOpacity.value = withDelay(
      650,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      650,
      withSpring(0, { damping: 14, stiffness: 180 })
    );

    // 6. Continue CTA & Progress bar
    ctaOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    ctaScale.value = withDelay(
      900,
      withSpring(1, { damping: 13, stiffness: 200 })
    );
    progressWidth.value = withTiming(100, {
      duration: AUTO_NAV_MS,
      easing: Easing.linear,
    });

    // 7. Auto-transition timer
    const timer = setTimeout(() => {
      navigateToHome();
    }, AUTO_NAV_MS);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToHome]);

  // Animated styles
  const bgGlowStyle = useAnimatedStyle(() => ({
    opacity: bgGlowOpacity.value,
    transform: [{ scale: bgGlowScale.value }],
  }));

  const carBadgeStyle = useAnimatedStyle(() => ({
    opacity: carBadgeOpacity.value,
    transform: [{ scale: carBadgeScale.value }],
  }));

  const waterSweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waterSweep.value }],
    opacity: interpolate(waterSweep.value, [-120, 0, 120], [0, 0.75, 0]),
  }));

  const shineSweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineSweep.value }, { rotate: '25deg' }],
    opacity: interpolate(shineSweep.value, [-120, 0, 120], [0, 0.9, 0]),
  }));

  const dropletStyle = useAnimatedStyle(() => ({
    opacity: dropletOpacity.value,
    transform: [{ translateY: dropletTranslateY.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Context-aware text derivation
  const firstName = user?.fullname ? user.fullname.trim().split(' ')[0] : '';
  const authType = params.type || 'login';

  let headingText = 'Welcome Back!';
  let subtitleText = "You're ready for a fresh start.";

  if (authType === 'register') {
    headingText = 'Welcome to The Black Wash';
    subtitleText = 'Your premium car-care experience starts here.';
  } else if (authType === 'verify') {
    headingText = "You're Verified!";
    subtitleText = 'Your account is ready.';
  } else if (firstName) {
    headingText = `Welcome Back, ${firstName}!`;
    subtitleText = "You're ready for a fresh start.";
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Ambient Deep Cyan Lighting Glow in Center */}
      <Animated.View style={[styles.ambientGlow, bgGlowStyle]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.container}>
          {/* Top Brand Pill */}
          <View style={styles.topBrandPill}>
            <ShieldCheck size={12} color={Colors.cyanBlue} />
            <AppText variant="overline" color={Colors.cyanBlue} style={styles.brandPillText}>
              AUTHENTICATION SUCCESSFUL
            </AppText>
          </View>

          {/* Central Car-Wash "From Water Splash to Fresh Shine" Animation */}
          <View style={styles.animationArea}>
            {/* Ambient Concentric Rings */}
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />

            {/* Floating Droplet Sprays */}
            <Animated.View style={[styles.dropletLeft, dropletStyle]}>
              <Droplets size={16} color={Colors.cyanBlue} />
            </Animated.View>

            <Animated.View style={[styles.dropletRight, dropletStyle]}>
              <Droplets size={14} color={Colors.electricBlue} />
            </Animated.View>

            {/* Sparkle Badges popping on shine finish */}
            <Animated.View style={[styles.sparkleTopRight, sparkleStyle]}>
              <Sparkles size={16} color={Colors.cyanBlue} />
            </Animated.View>

            <Animated.View style={[styles.sparkleBottomLeft, sparkleStyle]}>
              <Sparkles size={13} color={Colors.cyanBlue} />
            </Animated.View>

            {/* Central Car Detailing Badge */}
            <Animated.View style={[styles.carBadge, carBadgeStyle]}>
              <Car size={46} color={Colors.white} strokeWidth={1.75} />

              {/* Water-Sweep Overlay Wave */}
              <Animated.View style={[styles.waterWave, waterSweepStyle]} />

              {/* High-Gloss Shine Beam */}
              <Animated.View style={[styles.shineBeam, shineSweepStyle]} />
            </Animated.View>
          </View>

          {/* Context-Aware Heading & Message */}
          <Animated.View style={[styles.textBlock, textStyle]}>
            <View style={styles.badgeSuccess}>
              <View style={styles.badgeDot} />
              <AppText variant="overline" color={Colors.cyanBlue} style={styles.badgeSuccessText}>
                THE BLACK WASH
              </AppText>
            </View>

            <AppText
              variant="h2"
              weight="bold"
              color={Colors.textPrimary}
              center
              style={[styles.headline, isSmallScreen && styles.headlineSmall]}
            >
              {headingText}
            </AppText>

            <AppText
              variant="body"
              color={Colors.textSecondary}
              center
              style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}
            >
              {subtitleText}
            </AppText>
          </Animated.View>

          {/* Bottom Action Area: Progress & 1-Tap Continue CTA */}
          <View style={styles.bottomArea}>
            {/* Auto-Navigation Progress Bar */}
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, progressStyle]} />
            </View>

            {/* 1-Tap Continue Button */}
            <Animated.View style={ctaAnimatedStyle}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={navigateToHome}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Continue to Home"
              >
                <AppText variant="body" weight="bold" color={Colors.primaryBlack} style={styles.continueText}>
                  Explore The Black Wash
                </AppText>
                <View style={styles.arrowCircle}>
                  <ArrowRight size={15} color={Colors.primaryBlack} strokeWidth={2.2} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  ambientGlow: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 12,
  },
  topBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 25, 35, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  brandPillText: {
    letterSpacing: 1.2,
    fontSize: 9.5,
  },
  animationArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.sm,
  },
  outerRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.12)',
  },
  middleRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    backgroundColor: 'rgba(16, 25, 35, 0.40)',
  },
  carBadge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 2,
    borderColor: Colors.cyanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  waterWave: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(0, 207, 255, 0.35)',
    borderRadius: 20,
  },
  shineBeam: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  dropletLeft: {
    position: 'absolute',
    top: 35,
    left: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropletRight: {
    position: 'absolute',
    bottom: 35,
    right: 20,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(22, 139, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(22, 139, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 207, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 207, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3.5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.cyanBlue,
  },
  badgeSuccessText: {
    letterSpacing: 1.2,
    fontSize: 9,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  headlineSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
    marginTop: 2,
  },
  subtitleSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  progressBarTrack: {
    width: 140,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.cyanBlue,
    borderRadius: 1.5,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cyanBlue,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    fontSize: FontSize.md,
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 11, 16, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
