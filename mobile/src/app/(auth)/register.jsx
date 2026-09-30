import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import {
  AuthHeader,
  AuthErrorMessage,
} from '@/features/auth/components';
import { registerSchema } from '@/features/auth/validation/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { openLegalUrl, LEGAL_URLS } from '@/constants/legal';

/**
 * Register Screen
 *
 * Requirements:
 * - Solid premium dark branding matching Home screen (#080B10 / #101923)
 * - Rounded AuthHeader with brand badge & back action
 * - Coordinated Reanimated entrance animations (header drop-in, form card slide-up)
 * - Dark surface form card (#121C27) with border (#263442)
 * - Minimal fields matching backend: fullname, email, password, confirmPassword
 * - React Hook Form + Zod schema validation
 * - Clear inline validation & API error handling
 * - On success: triggers OTP verification email & navigates to /(auth)/otp-verify
 */
export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, isLoading, apiError, clearError } = useRegister();

  // Entrance animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-12);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(18);
  const bottomOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Header entrance
    headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) });

    // 2. Form card slide-up
    formOpacity.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    formTranslateY.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 220 }));

    // 3. Bottom switch prompt
    bottomOpacity.value = withDelay(300, withTiming(1, { duration: 450 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const animatedBottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullname: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit((data) => {
    clearError();
    submit(data, {
      onSuccess: (email) => {
        router.push({
          pathname: '/(auth)/otp-verify',
          params: { email },
        });
      },
    });
  });

  const handleRetry = () => {
    const values = getValues();
    if (values.fullname && values.email && values.password) {
      onSubmit();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        {/* Animated Rounded Top Auth Header with Back Button */}
        <Animated.View style={animatedHeaderStyle}>
          <AuthHeader
            showBack
            onBack={() => router.back()}
            badge="THE BLACK WASH · NEW CUSTOMER"
            title="Create Account"
            subtitle="Get premium doorstep car detailing at your location"
          />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Premium Dark Surface Form Card */}
            <Animated.View style={[styles.formCard, animatedFormStyle]}>
              {/* Full Name Input */}
              <Controller
                control={control}
                name="fullname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Full name"
                    labelColor={Colors.textSecondary}
                    placeholder="e.g. John Doe"
                    value={value}
                    onChangeText={(v) => {
                      clearError();
                      onChange(v);
                    }}
                    onBlur={onBlur}
                    error={errors.fullname?.message}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    disabled={isLoading}
                    leftIcon={<User size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* Email Address Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email address"
                    labelColor={Colors.textSecondary}
                    placeholder="you@example.com"
                    value={value}
                    onChangeText={(v) => {
                      clearError();
                      onChange(v);
                    }}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    disabled={isLoading}
                    leftIcon={<Mail size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Password"
                    labelColor={Colors.textSecondary}
                    placeholder="Create a strong password"
                    value={value}
                    onChangeText={(v) => {
                      clearError();
                      onChange(v);
                    }}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    disabled={isLoading}
                    leftIcon={<Lock size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword((v) => !v)}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                        ) : (
                          <Eye size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                        )}
                      </TouchableOpacity>
                    }
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* Confirm Password Input */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Confirm password"
                    labelColor={Colors.textSecondary}
                    placeholder="Repeat your password"
                    value={value}
                    onChangeText={(v) => {
                      clearError();
                      onChange(v);
                    }}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                    disabled={isLoading}
                    leftIcon={<Lock size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowConfirm((v) => !v)}
                        accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showConfirm ? (
                          <EyeOff size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                        ) : (
                          <Eye size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                        )}
                      </TouchableOpacity>
                    }
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* API / Network Error Banner */}
              {apiError && (
                <AuthErrorMessage
                  message={apiError}
                  type="error"
                  onRetry={apiError.includes('Network') ? handleRetry : undefined}
                />
              )}

              {/* Legal Terms & Privacy Policy Notice */}
              <View style={styles.legalNoticeContainer}>
                <AppText variant="caption" color={Colors.textMuted} center style={styles.legalNoticeText}>
                  By creating an account, you agree to our{' '}
                  <AppText
                    variant="caption"
                    weight="semiBold"
                    color={Colors.cyanBlue}
                    onPress={() => openLegalUrl(LEGAL_URLS.terms)}
                    accessibilityRole="link"
                    accessibilityLabel="Open Terms of Service"
                  >
                    Terms of Service
                  </AppText>{' '}
                  and{' '}
                  <AppText
                    variant="caption"
                    weight="semiBold"
                    color={Colors.cyanBlue}
                    onPress={() => openLegalUrl(LEGAL_URLS.privacyPolicy)}
                    accessibilityRole="link"
                    accessibilityLabel="Open Privacy Policy"
                  >
                    Privacy Policy
                  </AppText>
                  .
                </AppText>
              </View>

              {/* Submit CTA */}
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                onPress={onSubmit}
                loading={isLoading}
                disabled={!isValid || isLoading}
                style={styles.submitButton}
              >
                Create Account
              </AppButton>
            </Animated.View>

            {/* Bottom Login Switch Prompt */}
            <Animated.View style={[styles.bottomSwitchRow, animatedBottomStyle]}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                disabled={isLoading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Navigate to Login"
              >
                <AppText variant="bodySmall" weight="bold" color={Colors.cyanBlue}>
                  Sign In →
                </AppText>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  formCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Shadows.card,
  },
  darkInputContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
  },
  inputTextDark: {
    color: Colors.textPrimary,
  },
  legalNoticeContainer: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  legalNoticeText: {
    lineHeight: 18,
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
  bottomSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
