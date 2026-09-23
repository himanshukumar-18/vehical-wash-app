import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import {
  AuthBackground,
  AuthHeader,
  AuthErrorMessage,
  OtpInput,
} from '@/features/auth/components';
import { useOtpVerify } from '@/features/auth/hooks/useOtpVerify';

/**
 * OTP Verification Screen
 *
 * Requirements:
 * - Full-screen cinematic backdrop with dark scrim overlay
 * - Poppins typography across every text element
 * - Frosted-glass form container
 * - 6-digit segmented OTP input with auto-advance and clipboard paste
 * - Displays masked email destination & 10-minute expiry warning
 * - Handles attempt countdown & rate limit blocking
 * - On success: routes to Login with verified confirmation
 */
const MAX_ATTEMPTS = 5;

export default function OtpVerifyScreen() {
  const { email } = useLocalSearchParams();
  const [otpValue, setOtpValue] = useState('');

  const { submit, isLoading, apiError, clearError, failedAttempts } = useOtpVerify();

  const maskedEmail = email
    ? String(email).replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email';

  const remainingAttempts = MAX_ATTEMPTS - failedAttempts;
  const isBlocked = failedAttempts >= MAX_ATTEMPTS;
  const showAttemptWarning = failedAttempts >= 2 && !isBlocked;

  const handleVerify = useCallback(() => {
    if (!email || otpValue.length !== 6 || isLoading || isBlocked) return;
    clearError();
    submit(
      { email: String(email), otp: otpValue },
      {
        onSuccess: () => {
          router.replace({
            pathname: '/(auth)/login',
            params: { email: String(email), verified: 'true' },
          });
        },
      },
    );
  }, [email, otpValue, isLoading, isBlocked, clearError, submit]);

  const handleOtpChange = useCallback(
    (value) => {
      setOtpValue(value);
      if (apiError) clearError();
    },
    [apiError, clearError],
  );

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
              accessibilityLabel="Go back to registration"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={16} color={Colors.cyanBlue} />
              <AppText variant="bodyMedium" weight="medium" color={Colors.cyanBlue}>
                Back
              </AppText>
            </TouchableOpacity>

            {/* Header */}
            <AuthHeader
              badge="THE BLACK WASH · SECURITY"
              title="Verify Email"
              subtitle={`We sent a 6-digit confirmation code to ${maskedEmail}`}
              center
            />

            {/* Frosted Glass Form Card */}
            <View style={styles.formCard}>
              {/* Mail Icon Highlight */}
              <View style={styles.iconContainer}>
                <Mail size={28} color={Colors.cyanBlue} strokeWidth={1.75} />
              </View>

              {/* 6-Digit Segmented OTP Input */}
              <View style={styles.otpWrapper}>
                <OtpInput
                  value={otpValue}
                  onChange={handleOtpChange}
                  hasError={!!apiError}
                  disabled={isLoading || isBlocked}
                />
              </View>

              {/* Attempt Countdown Warning */}
              {showAttemptWarning && (
                <AuthErrorMessage
                  message={`${remainingAttempts} verification attempt${
                    remainingAttempts !== 1 ? 's' : ''
                  } remaining.`}
                  type="warning"
                />
              )}

              {/* Blocked State */}
              {isBlocked && (
                <AuthErrorMessage
                  message="Too many failed attempts. Please register again to generate a new verification code."
                  type="error"
                />
              )}

              {/* API / Invalid OTP Error Banner */}
              {apiError && !isBlocked && (
                <AuthErrorMessage
                  message={apiError}
                  type="error"
                  onRetry={apiError.includes('Network') ? handleVerify : undefined}
                />
              )}

              {/* Verify CTA */}
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleVerify}
                loading={isLoading}
                disabled={otpValue.length !== 6 || isLoading || isBlocked}
                style={styles.submitButton}
              >
                Verify & Continue
              </AppButton>

              {/* Expiry & Spam Notice */}
              <View style={styles.noticeSection}>
                <AppText variant="caption" color={Colors.textSecondary} center>
                  Didn&apos;t receive the email? Check your spam folder.
                </AppText>
                <AppText
                  variant="caption"
                  weight="medium"
                  color={Colors.cyanBlue}
                  center
                  style={styles.expiryText}
                >
                  Code expires in 10 minutes
                </AppText>
              </View>
            </View>

            {/* Change Email Navigation */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/register')}
                accessibilityRole="button"
                accessibilityLabel="Use a different email address"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="bodySmall" weight="semiBold" color={Colors.cyanBlue} center>
                  Use a different email address
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
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.xs,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  noticeSection: {
    gap: 4,
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  expiryText: {
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
});
