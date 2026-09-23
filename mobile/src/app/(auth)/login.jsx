import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows, FontSize } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import {
  AuthBackground,
  AuthHeader,
  AuthErrorMessage,
} from '@/features/auth/components';
import { loginSchema } from '@/features/auth/validation/loginSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';

/**
 * Login Screen
 *
 * Requirements:
 * - Full-screen cinematic backdrop with dark scrim overlay
 * - Poppins typography across every text element
 * - Frosted-glass form container
 * - React Hook Form + Zod schema validation
 * - Clear field-level error messages
 * - Prevents duplicate submissions & displays API error mapping
 * - On success: transitions to Welcome animation (/(auth)/auth-success)
 */
export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const { submit, isLoading, apiError, clearError } = useLogin();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // Derive success message directly from route params if email was just verified
  const successMessage =
    params.verified === 'true' ? 'Email verified successfully! Please sign in.' : null;

  // Pre-fill email if passed from OTP verification screen
  useEffect(() => {
    if (params.email) {
      setValue('email', String(params.email));
    }
  }, [params.email, setValue]);

  const onSubmit = handleSubmit((data) => {
    clearError();
    submit(data, {
      onSuccess: () => router.replace('/(auth)/auth-success'),
    });
  });

  const handleRetry = () => {
    const values = getValues();
    if (values.email && values.password) {
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
            {/* Header with Brand Badge */}
            <AuthHeader
              badge="THE BLACK WASH · DOORSTEP CARE"
              title="Welcome Back"
              subtitle="Sign in to your account for doorstep car detailing"
            />

            {/* Verified Email Success Banner */}
            {successMessage && (
              <AuthErrorMessage
                message={successMessage}
                type="success"
                style={styles.alertBanner}
              />
            )}

            {/* Frosted Glass Form Card */}
            <View style={styles.formCard}>
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
                    placeholder="Enter your password"
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
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
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

              {/* API / Network Error Banner */}
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
                Log In
              </AppButton>
            </View>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              <AppText variant="body" color={Colors.textSecondary}>
                Don&apos;t have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                accessibilityRole="link"
                accessibilityLabel="Create an account"
              >
                <AppText variant="bodyMedium" weight="semiBold" color={Colors.cyanBlue}>
                  Create account
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
    justifyContent: 'center',
  },
  alertBanner: {
    marginBottom: Spacing.md,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
    flexWrap: 'wrap',
  },
});
