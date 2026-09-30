import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Droplets, ArrowRight, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius, FontSize } from '@/theme';
import AppText from '@/components/ui/AppText';
import { useSessionRestore } from '@/features/auth/hooks/useSessionRestore';
import { IS_DEV_HOME_PREVIEW } from '@/constants/devPreview';

const SPLASH_BG_IMAGE = require('@/assets/images/login-register.png');

/**
 * Splash & Welcome Onboarding Screen
 *
 * Cinematic automotive welcome experience for The Black Wash:
 * - Zone A: Minimal top brand header ("THE BLACK WASH · DOORSTEP CAR CARE")
 * - Zone B: Dominant cinematic car-wash backdrop with multi-stop seamless gradient
 * - Zone C: High-contrast headline ("Your Car. Our Care."), supporting copy,
 *           and premium cyan "Get Started" CTA with press micro-interactions
 * - Smooth entrance animations sequence orchestrated with React Native Reanimated
 * - Responsive layout adapted for small, medium, and large iPhone screen heights
 * - Seamless background session restore without blocking UI
 */
export default function SplashScreen_() {
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const restoreResult = useRef(null);
  const navigated = useRef(false);

  // Reanimated entrance animation shared values
  const bgOpacity = useSharedValue(0);
  const topBrandOpacity = useSharedValue(0);
  const topBrandTranslateY = useSharedValue(-14);
  const headlineOpacity = useSharedValue(0);
  const headlineTranslateY = useSharedValue(24);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.92);
  const pressScale = useSharedValue(1);

  const navigateToApp = useCallback((authenticated) => {
    if (navigated.current) return;
    navigated.current = true;
    if (authenticated || IS_DEV_HOME_PREVIEW) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, []);

  // Handle background session restore
  const onRestoreComplete = useCallback(({ authenticated }) => {
    restoreResult.current = authenticated;
  }, []);

  useSessionRestore(onRestoreComplete);

  // Orchestrated entrance animation sequence
  useEffect(() => {
    SplashScreen.hideAsync();

    // 1. Background Image Fade-In
    bgOpacity.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Top Brand Pill Drop-In
    topBrandOpacity.value = withDelay(
      150,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    topBrandTranslateY.value = withDelay(
      150,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 3. Headline Slide-Up
    headlineOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })
    );
    headlineTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) })
    );

    // 4. Subtitle Fade-In
    subtitleOpacity.value = withDelay(
      450,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    subtitleTranslateY.value = withDelay(
      450,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 5. CTA Button Entrance with smooth scale
    ctaOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) })
    );
    ctaScale.value = withDelay(
      600,
      withTiming(1, { duration: 550, easing: Easing.out(Easing.back(1.4)) })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetStarted = () => {
    const isAuth = restoreResult.current === true;
    navigateToApp(isAuth);
  };

  const handlePressIn = () => {
    pressScale.value = withTiming(0.96, { duration: 120 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 160 });
  };

  // Animated styles
  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const topBrandAnimatedStyle = useAnimatedStyle(() => ({
    opacity: topBrandOpacity.value,
    transform: [{ translateY: topBrandTranslateY.value }],
  }));

  const headlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value * pressScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cinematic Car-Wash Background Image with Opacity Fade */}
      <Animated.View style={[StyleSheet.absoluteFillObject, bgAnimatedStyle]}>
        <ImageBackground
          source={SPLASH_BG_IMAGE}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Seamless Full-Screen Multi-Stop Linear Gradient Scrim */}
          <Svg
            height="100%"
            width="100%"
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient id="splashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#080B10" stopOpacity="0.75" />
                <Stop offset="20%" stopColor="#080B10" stopOpacity="0.25" />
                <Stop offset="45%" stopColor="#080B10" stopOpacity="0.35" />
                <Stop offset="65%" stopColor="#080B10" stopOpacity="0.75" />
                <Stop offset="82%" stopColor="#080B10" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#080B10" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#splashGradient)" />
          </Svg>
        </ImageBackground>
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        {/* ============================================================ */}
        {/* ZONE A: TOP BRAND AREA                                       */}
        {/* ============================================================ */}
        <Animated.View style={[styles.topBrandContainer, topBrandAnimatedStyle]}>
          <View style={styles.brandPill}>
            <Droplets size={13} color={Colors.cyanBlue} />
            <AppText variant="caption" weight="bold" color={Colors.textPrimary} style={styles.brandPillText}>
              THE BLACK WASH
            </AppText>
            <View style={styles.brandDot} />
            <AppText variant="caption" color={Colors.cyanBlue} style={styles.taglineText}>
              DOORSTEP CAR CARE
            </AppText>
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/* ZONE B: MAIN CINEMATIC VISUAL SPACER                          */}
        {/* ============================================================ */}
        <View style={styles.visualSpacer} />

        {/* ============================================================ */}
        {/* ZONE C: BOTTOM CONTENT + CTA                                 */}
        {/* ============================================================ */}
        <View style={[styles.bottomContentCard, isSmallScreen && styles.bottomContentCardSmall]}>
          {/* Dispatch Badge */}
          <Animated.View style={[styles.sparkleBadgeRow, headlineAnimatedStyle]}>
            <View style={styles.sparkleBadge}>
              <Sparkles size={11} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="bold" color={Colors.cyanBlue} style={styles.sparkleBadgeText}>
                HAZARIBAGH DISPATCH
              </AppText>
            </View>
          </Animated.View>

          {/* Main Headline */}
          <Animated.View style={headlineAnimatedStyle}>
            <AppText
              variant="h1"
              weight="bold"
              color={Colors.textPrimary}
              style={[styles.headlineTitle, isSmallScreen && styles.headlineTitleSmall]}
            >
              Your Car.{'\n'}
              <AppText
                variant="h1"
                weight="bold"
                color={Colors.cyanBlue}
                style={[styles.headlineAccent, isSmallScreen && styles.headlineTitleSmall]}
              >
                Our Care.
              </AppText>
            </AppText>
          </Animated.View>

          {/* Supporting Subtitle */}
          <Animated.View style={subtitleAnimatedStyle}>
            <AppText
              variant="body"
              color={Colors.textSecondary}
              style={[styles.subtitleText, isSmallScreen && styles.subtitleTextSmall]}
            >
              Premium doorstep car care, made effortless.
            </AppText>
          </Animated.View>

          {/* Premium CTA Button */}
          <Animated.View style={[styles.ctaWrapper, ctaAnimatedStyle]}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.92}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
            >
              <AppText variant="body" weight="bold" color={Colors.primaryBlack} style={styles.getStartedText}>
                Get Started
              </AppText>
              <View style={styles.arrowCircle}>
                <ArrowRight size={16} color={Colors.primaryBlack} strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Subtle Delivery Note */}
          <Animated.View style={subtitleAnimatedStyle}>
            <AppText variant="caption" color={Colors.textMuted} center style={styles.footerText}>
              Doorstep detailing & wash delivered at your location
            </AppText>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  topBrandContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 25, 35, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.28)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    gap: 6,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  brandPillText: {
    letterSpacing: 1.5,
    fontSize: 11,
  },
  brandDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.cyanBlue,
  },
  taglineText: {
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
  },
  visualSpacer: {
    flex: 1,
    minHeight: 40,
  },
  bottomContentCard: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl + 10,
  },
  bottomContentCardSmall: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  sparkleBadgeRow: {
    alignSelf: 'flex-start',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.28)',
    borderRadius: Radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    gap: 4,
  },
  sparkleBadgeText: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  headlineTitle: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  headlineTitleSmall: {
    fontSize: 28,
    lineHeight: 34,
  },
  headlineAccent: {
    fontSize: 34,
    lineHeight: 40,
  },
  subtitleText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  subtitleTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaWrapper: {
    marginTop: Spacing.xs,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cyanBlue,
    height: 54,
    borderRadius: 27,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    fontSize: FontSize.lg,
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 11, 16, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
