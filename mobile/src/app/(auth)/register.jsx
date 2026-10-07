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
import { Eye, EyeOff, Mail, Lock, User, Phone, Smartphone } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import {
  AuthHeader,
  AuthErrorMessage,
  GoogleSignInButton,
} from '@/features/auth/components';
import { registerSchema } from '@/features/auth/validation/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { openLegalUrl, LEGAL_URLS } from '@/constants/legal';

/**
 * Register Screen
 *
 * Supports:
 * - Full Name, Email, Mobile Number (optional), Password, Confirm Password
 * - Direct Google Sign-In
 * - Fast Phone OTP Sign-In alternative
 */
export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, isLoading, apiError, clearError } = useRegister();
  const {
    promptGoogleSignIn,
    isLoading: isGoogleLoading,
    apiError: googleApiError,
    clearError: clearGoogleError,
  } = useGoogleAuth();

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-12);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(18);
  const bottomOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) });

    formOpacity.value = withDelay(150, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    formTranslateY.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 220 }));

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullname: '', email: '', phone: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit((data) => {
    clearError();
    clearGoogleError();
    submit(data, {
      onSuccess: (email) => {
        router.push({
          pathname: '/(auth)/otp-verify',
          params: { type: 'email', email },
        });
      },
    });
  });

  const handleGoogleSignIn = () => {
    clearError();
    clearGoogleError();
    promptGoogleSignIn({
      onSuccess: () => {
        router.replace({
          pathname: '/(auth)/auth-success',
          params: { type: 'login' },
        });
      },
    });
  };

  const handleRetry = () => {
    const values = getValues();
    if (values.fullname && values.email && values.password) {
      onSubmit();
    }
  };

  const isSubmitting = isLoading || isGoogleLoading;
  const currentError = apiError || googleApiError;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        {/* Animated Rounded Top Auth Header */}
        <Animated.View style={animatedHeaderStyle}>
          <AuthHeader
            badge="THE BLACK WASH · JOIN"
            title="Create Account"
            subtitle="Sign up for premium doorstep car detailing"
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
            {/* Quick Phone Sign-in Banner */}
            <TouchableOpacity
              style={styles.phoneBanner}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Smartphone size={16} color={Colors.cyanBlue} />
              <AppText variant="caption" weight="semiBold" color={Colors.cyanBlue}>
                Have a mobile number? Instant Phone OTP Login →
              </AppText>
            </TouchableOpacity>

            {/* Form Card */}
            <Animated.View style={[styles.formCard, animatedFormStyle]}>
              {/* Full Name Input */}
              <Controller
                control={control}
                name="fullname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Full Name"
                    labelColor={Colors.textSecondary}
                    placeholder="e.g. Rahul Sharma"
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
                    disabled={isSubmitting}
                    leftIcon={<User size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* Email Input */}
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
                    disabled={isSubmitting}
                    leftIcon={<Mail size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* Mobile Phone Input (Optional) */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Mobile Number (Optional)"
                    labelColor={Colors.textSecondary}
                    placeholder="e.g. 9876543210"
                    value={value}
                    onChangeText={(v) => {
                      clearError();
                      onChange(v);
                    }}
                    onBlur={onBlur}
                    error={errors.phone?.message}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    returnKeyType="next"
                    disabled={isSubmitting}
                    leftIcon={<Phone size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                    inputContainerStyle={styles.darkInputContainer}
                    inputStyle={styles.inputTextDark}
                    helper="Used for doorstep wash appointment updates"
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
                    placeholder="Create a strong password (min 8 chars)"
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
              {currentError && (
                <AuthErrorMessage
                  message={currentError}
                  type="error"
                  onRetry={currentError.includes('Network') ? handleRetry : undefined}
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
                disabled={isSubmitting}
                style={styles.submitButton}
              >
                Create Account
              </AppButton>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <AppText variant="caption" color={Colors.textMuted} style={styles.dividerText}>
                  OR
                </AppText>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign-In */}
              <GoogleSignInButton
                onPress={handleGoogleSignIn}
                loading={isGoogleLoading}
                disabled={isSubmitting}
              />
            </Animated.View>

            {/* Bottom Login Switch Prompt */}
            <Animated.View style={[styles.bottomSwitchRow, animatedBottomStyle]}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                disabled={isSubmitting}
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
  phoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    letterSpacing: 1,
  },
  bottomSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
