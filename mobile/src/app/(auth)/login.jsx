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
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Phone, Smartphone } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import {
  AuthHeader,
  AuthErrorMessage,
  GoogleSignInButton,
} from '@/features/auth/components';
import { loginSchema } from '@/features/auth/validation/loginSchema';
import { phoneSchema } from '@/features/auth/validation/phoneSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { usePhoneAuth } from '@/features/auth/hooks/usePhoneAuth';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';

/**
 * Login Screen — Supports Phone OTP, Email & Password, and Google Authentication
 */
export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [authMode, setAuthMode] = useState(() => (params.email ? 'email' : 'phone'));
  const [showPassword, setShowPassword] = useState(false);

  // Email login hook
  const {
    submit: submitEmailLogin,
    isLoading: isEmailLoading,
    apiError: emailApiError,
    clearError: clearEmailError,
  } = useLogin();

  // Phone auth hook
  const {
    sendOtp: sendPhoneOtp,
    isSending: isPhoneSending,
    apiError: phoneApiError,
    clearError: clearPhoneError,
  } = usePhoneAuth();

  // Google auth hook
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

  // Email Form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    setValue: setEmailValue,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // Phone Form
  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onTouched',
  });

  // Pre-fill email if passed from OTP verification
  useEffect(() => {
    if (params.email) {
      setEmailValue('email', String(params.email));
    }
  }, [params.email, setEmailValue]);

  const successMessage =
    params.verified === 'true' ? 'Email verified successfully! Please sign in.' : null;

  const onEmailSubmit = handleEmailSubmit((data) => {
    clearEmailError();
    submitEmailLogin(data, {
      onSuccess: () =>
        router.replace({
          pathname: '/(auth)/auth-success',
          params: { type: 'login' },
        }),
    });
  });

  const onPhoneSubmit = handlePhoneSubmit((data) => {
    clearPhoneError();
    sendPhoneOtp(
      { phone: data.phone },
      {
        onSuccess: (formattedPhone) => {
          router.push({
            pathname: '/(auth)/otp-verify',
            params: { type: 'phone', phone: formattedPhone },
          });
        },
      },
    );
  });

  const handleGoogleSignIn = () => {
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

  const isSubmitting = isEmailLoading || isPhoneSending || isGoogleLoading;
  const currentError =
    authMode === 'phone' ? phoneApiError : emailApiError || googleApiError;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        {/* Animated Rounded Top Auth Header */}
        <Animated.View style={animatedHeaderStyle}>
          <AuthHeader
            badge="THE BLACK WASH · DOORSTEP CARE"
            title="Welcome Back"
            subtitle="Sign in to your account for doorstep car detailing"
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
            {/* Verified Email Success Banner */}
            {successMessage && (
              <AuthErrorMessage
                message={successMessage}
                type="success"
                style={styles.alertBanner}
              />
            )}

            {/* Mode Switch Tabs */}
            <Animated.View style={[styles.tabRow, animatedFormStyle]}>
              <TouchableOpacity
                style={[styles.tabButton, authMode === 'phone' && styles.tabButtonActive]}
                onPress={() => {
                  setAuthMode('phone');
                  clearPhoneError();
                }}
                activeOpacity={0.8}
              >
                <Smartphone
                  size={16}
                  color={authMode === 'phone' ? Colors.cyanBlue : Colors.textMuted}
                />
                <AppText
                  variant="label"
                  weight={authMode === 'phone' ? 'bold' : 'medium'}
                  color={authMode === 'phone' ? Colors.cyanBlue : Colors.textSecondary}
                >
                  Phone OTP
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, authMode === 'email' && styles.tabButtonActive]}
                onPress={() => {
                  setAuthMode('email');
                  clearEmailError();
                }}
                activeOpacity={0.8}
              >
                <Mail
                  size={16}
                  color={authMode === 'email' ? Colors.cyanBlue : Colors.textMuted}
                />
                <AppText
                  variant="label"
                  weight={authMode === 'email' ? 'bold' : 'medium'}
                  color={authMode === 'email' ? Colors.cyanBlue : Colors.textSecondary}
                >
                  Email & Password
                </AppText>
              </TouchableOpacity>
            </Animated.View>

            {/* Form Card */}
            <Animated.View style={[styles.formCard, animatedFormStyle]}>
              {authMode === 'phone' ? (
                /* Phone Number Login */
                <View style={styles.fieldsContainer}>
                  <Controller
                    control={phoneControl}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Mobile Number"
                        labelColor={Colors.textSecondary}
                        placeholder="e.g. 9876543210"
                        value={value}
                        onChangeText={(v) => {
                          clearPhoneError();
                          onChange(v);
                        }}
                        onBlur={onBlur}
                        error={phoneErrors.phone?.message}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                        returnKeyType="done"
                        onSubmitEditing={onPhoneSubmit}
                        disabled={isSubmitting}
                        leftIcon={<Phone size={18} color={Colors.cyanBlue} strokeWidth={1.8} />}
                        inputContainerStyle={styles.darkInputContainer}
                        inputStyle={styles.inputTextDark}
                        helper="We will send a 6-digit verification code via SMS"
                      />
                    )}
                  />

                  {currentError && (
                    <AuthErrorMessage
                      message={currentError}
                      type="error"
                      onRetry={onPhoneSubmit}
                    />
                  )}

                  <AppButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={onPhoneSubmit}
                    loading={isPhoneSending}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                  >
                    Get Verification Code →
                  </AppButton>
                </View>
              ) : (
                /* Email & Password Login */
                <View style={styles.fieldsContainer}>
                  <Controller
                    control={emailControl}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Email address"
                        labelColor={Colors.textSecondary}
                        placeholder="you@example.com"
                        value={value}
                        onChangeText={(v) => {
                          clearEmailError();
                          onChange(v);
                        }}
                        onBlur={onBlur}
                        error={emailErrors.email?.message}
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

                  <Controller
                    control={emailControl}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Password"
                        labelColor={Colors.textSecondary}
                        placeholder="Enter your password"
                        value={value}
                        onChangeText={(v) => {
                          clearEmailError();
                          onChange(v);
                        }}
                        onBlur={onBlur}
                        error={emailErrors.password?.message}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={onEmailSubmit}
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

                  {currentError && (
                    <AuthErrorMessage
                      message={currentError}
                      type="error"
                      onRetry={onEmailSubmit}
                    />
                  )}

                  <AppButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={onEmailSubmit}
                    loading={isEmailLoading}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                  >
                    Sign In
                  </AppButton>
                </View>
              )}

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

            {/* Bottom Register Switch Prompt */}
            <Animated.View style={[styles.bottomSwitchRow, animatedBottomStyle]}>
              <AppText variant="bodySmall" color={Colors.textSecondary}>
                Don&apos;t have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                disabled={isSubmitting}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Navigate to Register"
              >
                <AppText variant="bodySmall" weight="bold" color={Colors.cyanBlue}>
                  Create Account →
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
  alertBanner: {
    marginBottom: Spacing.xs,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
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
  fieldsContainer: {
    gap: Spacing.lg,
  },
  darkInputContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
  },
  inputTextDark: {
    color: Colors.textPrimary,
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
