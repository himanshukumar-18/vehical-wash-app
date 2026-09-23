import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows, FontSize } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import {
  AuthBackground,
  AuthHeader,
  AuthErrorMessage,
} from '@/features/auth/components';
import { registerSchema } from '@/features/auth/validation/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';

/**
 * Register Screen
 *
 * Requirements:
 * - Full-screen cinematic backdrop with dark scrim overlay
 * - Poppins typography across every text element
 * - Frosted-glass form container
 * - Minimal fields matching backend: fullname, email, password, confirmPassword
 * - React Hook Form + Zod schema validation
 * - Clear inline validation & API error handling
 * - On success: triggers OTP verification email & navigates to /(auth)/otp-verify
 */
export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, isLoading, apiError, clearError } = useRegister();

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
    <AuthBackground overlayOpacity={0.82}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="light" />
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back to login"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={16} color={Colors.cyanBlue} />
              <AppText variant="bodyMedium" weight="medium" color={Colors.cyanBlue}>
                Back to Sign In
              </AppText>
            </TouchableOpacity>

            {/* Header */}
            <AuthHeader
              badge="THE BLACK WASH · NEW CUSTOMER"
              title="Create Account"
              subtitle="Get premium doorstep car detailing at your location"
            />

            {/* Frosted Glass Form Card */}
            <View style={styles.formCard}>
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
                    inputContainerStyle={styles.glassInputContainer}
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
                    inputContainerStyle={styles.glassInputContainer}
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
                    placeholder="Min. 8 characters"
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
                    inputContainerStyle={styles.glassInputContainer}
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
                    inputContainerStyle={styles.glassInputContainer}
                    inputStyle={styles.inputTextDark}
                  />
                )}
              />

              {/* API Error Banner */}
              {apiError && (
                <AuthErrorMessage
                  message={apiError}
                  type="error"
                  onRetry={apiError.includes('Network') ? handleRetry : undefined}
                />
              )}

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

              {/* Subtext notice */}
              <View style={styles.otpNotice}>
                <AppText variant="caption" color={Colors.textSecondary} center>
                  A 6-digit verification code will be sent to your email.
                </AppText>
              </View>
            </View>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              <AppText variant="body" color={Colors.textSecondary}>
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                accessibilityRole="link"
                accessibilityLabel="Log in"
              >
                <AppText variant="bodyMedium" weight="semiBold" color={Colors.cyanBlue}>
                  Sign in
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  formCard: {
    backgroundColor: 'rgba(16, 25, 35, 0.76)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: Spacing.xl,
    gap: Spacing.lg,
    ...Shadows.lg,
  },
  glassInputContainer: {
    backgroundColor: 'rgba(8, 11, 16, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  inputTextDark: {
    color: Colors.white,
    fontSize: FontSize.md,
  },
  submitButton: {
    marginTop: Spacing.xs,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otpNotice: {
    marginTop: -2,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
    flexWrap: 'wrap',
  },
});
