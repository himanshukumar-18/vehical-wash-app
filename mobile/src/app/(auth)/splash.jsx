import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Colors, Spacing, FontSize } from '@/theme';
import AppText from '@/components/ui/AppText';
import { AuthBackground } from '@/features/auth/components';
import { useSessionRestore } from '@/features/auth/hooks/useSessionRestore';
import { IS_DEV_HOME_PREVIEW } from '@/constants/devPreview';

/**
 * Splash Screen
 *
 * Dual responsibility:
 *  1. Animated brand reveal (fade + slide up) over The Black Wash authentic backdrop.
 *  2. Session restoration — validates stored JWT tokens or attempts refresh.
 *
 * After BOTH the minimum animation duration AND session restore complete,
 * navigates to:
 *   - Authenticated OR Dev Preview Mode → /(tabs)
 *   - Not authenticated (Production / Standard) → /(auth)/login
 */

const MIN_DISPLAY_MS = 2200;

export default function SplashScreen_() {
  const restoreResult = useRef(null);
  const animationDone = useRef(false);
  const navigated = useRef(false);

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(24);
  const taglineOpacity = useSharedValue(0);
  const accentWidth = useSharedValue(0);
  const accentOpacity = useSharedValue(0);

  const navigate = useCallback((authenticated) => {
    if (navigated.current) return;
    navigated.current = true;
    if (authenticated || IS_DEV_HOME_PREVIEW) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, []);

  const tryNavigate = useCallback(() => {
    if (animationDone.current && restoreResult.current !== null) {
      navigate(restoreResult.current);
    }
  }, [navigate]);

  // Session restore callback
  const onRestoreComplete = useCallback(
    ({ authenticated }) => {
      restoreResult.current = authenticated;
      tryNavigate();
    },
    [tryNavigate],
  );

  useSessionRestore(onRestoreComplete);

  // Run animation sequence
  useEffect(() => {
    // Hide native splash immediately — custom splash takes over
    SplashScreen.hideAsync();

    // Animate logo in
    logoOpacity.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
    logoTranslateY.value = withTiming(0, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    // Animate accent line after logo appears
    accentOpacity.value = withDelay(
      350,
      withTiming(1, { duration: 300 }),
    );
    accentWidth.value = withDelay(
      350,
      withTiming(1, { duration: 750, easing: Easing.out(Easing.quad) }),
    );

    // Animate tagline after accent
    taglineOpacity.value = withDelay(
      750,
      withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }),
    );

    // Mark animation done after minimum display time
    const timer = setTimeout(() => {
      animationDone.current = true;
      logoOpacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(
          150,
          withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
            runOnJS(tryNavigate)();
          }),
        ),
      );
    }, MIN_DISPLAY_MS);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const accentStyle = useAnimatedStyle(() => ({
    opacity: accentOpacity.value,
    transform: [{ scaleX: accentWidth.value }],
  }));

  return (
    <AuthBackground overlayOpacity={0.88}>
      <View style={styles.container}>
        {/* Brand Reveal Content */}
        <View style={styles.content}>
          <Animated.View style={[styles.logoBlock, logoStyle]}>
            {/* Top Accent Indicators */}
            <View style={styles.dotRow}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotLarge]} />
              <View style={styles.dot} />
            </View>

            {/* Brand Title */}
            <AppText
              variant="h1"
              weight="bold"
              color={Colors.white}
              center
              style={styles.brandName}
            >
              THE BLACK WASH
            </AppText>

            {/* Cyan Accent Bar */}
            <Animated.View style={[styles.accentLine, accentStyle]} />
          </Animated.View>

          {/* Subtitle / Tagline */}
          <Animated.View style={[styles.taglineBlock, taglineStyle]}>
            <AppText
              variant="caption"
              weight="medium"
              color={Colors.cyanBlue}
              center
              style={styles.tagline}
            >
              PREMIUM DOORSTEP CAR CARE
            </AppText>
          </Animated.View>
        </View>

        {/* Bottom Location Indicator */}
        <View style={styles.footer}>
          <AppText variant="overline" color="rgba(255, 255, 255, 0.35)" center>
            Hazaribagh · Jharkhand · India
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.lg,
  },
  logoBlock: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.cyanBlue,
    opacity: 0.6,
  },
  dotLarge: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    opacity: 1,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  brandName: {
    letterSpacing: 5,
    fontSize: FontSize['4xl'],
  },
  accentLine: {
    height: 2.5,
    width: 140,
    backgroundColor: Colors.cyanBlue,
    borderRadius: 1.5,
    transformOrigin: 'left',
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  taglineBlock: {
    marginTop: Spacing.sm,
  },
  tagline: {
    letterSpacing: 3,
    fontSize: FontSize.xs,
  },
  footer: {
    paddingBottom: Spacing['3xl'],
  },
});
