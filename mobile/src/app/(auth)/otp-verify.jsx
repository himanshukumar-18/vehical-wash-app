import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, Phone, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';
import AppButton from '@/components/ui/AppButton';
import {
  AuthHeader,
  AuthErrorMessage,
  OtpInput,
} from '@/features/auth/components';
import { useOtpVerify } from '@/features/auth/hooks/useOtpVerify';
import { useResendOtp } from '@/features/auth/hooks/useResendOtp';
import { usePhoneAuth } from '@/features/auth/hooks/usePhoneAuth';

/**
 * OTP Verification Screen
 *
 * Supports:
 * 1. Email OTP verification (`type: 'email'`)
 * 2. Phone SMS OTP verification (`type: 'phone'`)
 * 3. 6-digit segmented OTP input with auto-advance and clipboard paste
 * 4. Resend code with 60-second cooldown timer
 * 5. Attempt countdown & rate limit handling
 */
const MAX_ATTEMPTS = 5;

export default function OtpVerifyScreen() {
  const { type = 'email', email, phone } = useLocalSearchParams();
  const isPhone = type === 'phone';

  const [otpValue, setOtpValue] = useState('');
  const [resendSuccessMessage, setResendSuccessMessage] = useState(null);

  // Email verify hook
  const {
    submit: submitEmailVerify,
    isLoading: isEmailVerifying,
    apiError: emailApiError,
    clearError: clearEmailError,
    failedAttempts: emailFailedAttempts,
  } = useOtpVerify();

  // Email resend hook
  const {
    resend: resendEmailOtp,
    isLoading: isEmailResending,
    apiError: emailResendError,
    clearError: clearEmailResendError,
    cooldownSeconds: emailCooldown,
    canResend: canResendEmail,
  } = useResendOtp(60);

  // Phone auth hook (send & verify)
  const {
    sendOtp: sendPhoneOtp,
    verifyOtp: verifyPhoneOtp,
    isSending: isPhoneResending,
    isVerifying: isPhoneVerifying,
    apiError: phoneApiError,
    clearError: clearPhoneError,
  } = usePhoneAuth();

  const [phoneFailedAttempts, setPhoneFailedAttempts] = useState(0);

  const destinationText = isPhone
    ? phone
      ? String(phone).replace(/(.{3})(.*)(.{4})/, '$1****$3')
      : 'your mobile number'
    : email
    ? String(email).replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email address';

  const failedAttempts = isPhone ? phoneFailedAttempts : emailFailedAttempts;
  const remainingAttempts = MAX_ATTEMPTS - failedAttempts;
  const isBlocked = failedAttempts >= MAX_ATTEMPTS;
  const showAttemptWarning = failedAttempts >= 2 && !isBlocked;

  const isVerifying = isPhone ? isPhoneVerifying : isEmailVerifying;
  const isResending = isPhone ? isPhoneResending : isEmailResending;
  const activeError = isPhone ? phoneApiError : emailApiError || emailResendError;

  const handleVerify = useCallback(() => {
    if (otpValue.length !== 6 || isVerifying || isBlocked) return;
    setResendSuccessMessage(null);

    if (isPhone) {
      if (!phone) return;
      clearPhoneError();
      verifyPhoneOtp(
        { phone: String(phone), otp: otpValue },
        {
          onSuccess: () => {
            router.replace({
              pathname: '/(auth)/auth-success',
              params: { type: 'login' },
            });
          },
        },
      ).catch(() => {
        setPhoneFailedAttempts((prev) => prev + 1);
      });
    } else {
      if (!email) return;
      clearEmailError();
      submitEmailVerify(
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
    }
  }, [
    otpValue,
    isVerifying,
    isBlocked,
    isPhone,
    phone,
    email,
    clearPhoneError,
    clearEmailError,
    verifyPhoneOtp,
    submitEmailVerify,
  ]);

  const handleOtpChange = useCallback(
    (value) => {
      setOtpValue(value);
      if (emailApiError) clearEmailError();
      if (phoneApiError) clearPhoneError();
    },
    [emailApiError, phoneApiError, clearEmailError, clearPhoneError],
  );

  const handleResend = useCallback(() => {
    if (isResending) return;
    clearEmailError();
    clearPhoneError();
    clearEmailResendError();
    setResendSuccessMessage(null);

    if (isPhone) {
      if (!phone) return;
      sendPhoneOtp(
        { phone: String(phone) },
        {
          onSuccess: () => {
            setResendSuccessMessage('A fresh verification code has been sent via SMS.');
            setOtpValue('');
          },
        },
      );
    } else {
      if (!email || !canResendEmail) return;
      resendEmailOtp(
        { email: String(email) },
        {
          onSuccess: () => {
            setResendSuccessMessage('A fresh verification code has been sent to your email.');
            setOtpValue('');
          },
        },
      );
    }
  }, [
    isResending,
    clearEmailError,
    clearPhoneError,
    clearEmailResendError,
    isPhone,
    phone,
    email,
    canResendEmail,
    sendPhoneOtp,
    resendEmailOtp,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header with Back Button */}
        <AuthHeader
          showBack
          onBack={() => router.back()}
          badge="THE BLACK WASH · SECURITY"
          title={isPhone ? 'Verify Mobile' : 'Verify Email'}
          subtitle={`Enter the 6-digit code sent to ${destinationText}`}
        />

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
            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Icon Highlight */}
              <View style={styles.iconContainer}>
                {isPhone ? (
                  <Phone size={26} color={Colors.cyanBlue} strokeWidth={1.75} />
                ) : (
                  <Mail size={26} color={Colors.cyanBlue} strokeWidth={1.75} />
                )}
              </View>

              {/* 6-Digit Segmented OTP Input */}
              <View style={styles.otpWrapper}>
                <OtpInput
                  value={otpValue}
                  onChange={handleOtpChange}
                  hasError={!!activeError}
                  disabled={isVerifying || isBlocked}
                />
              </View>

              {/* Resend OTP Button & Cooldown */}
              <View style={styles.resendSection}>
                {!isPhone && emailCooldown > 0 ? (
                  <View style={styles.cooldownBadge}>
                    <AppText variant="caption" color={Colors.textSecondary} center>
                      Resend code in{' '}
                      <AppText variant="caption" weight="semiBold" color={Colors.cyanBlue}>
                        {emailCooldown}s
                      </AppText>
                    </AppText>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={isVerifying || isResending}
                    activeOpacity={0.7}
                    style={styles.resendButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {isResending ? (
                      <ActivityIndicator size="small" color={Colors.cyanBlue} />
                    ) : (
                      <>
                        <RefreshCw size={13} color={Colors.cyanBlue} />
                        <AppText
                          variant="caption"
                          weight="semiBold"
                          color={Colors.cyanBlue}
                          center
                        >
                          Resend Code
                        </AppText>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Success Banner on Resend */}
              {resendSuccessMessage && (
                <AuthErrorMessage
                  message={resendSuccessMessage}
                  type="success"
                  onDismiss={() => setResendSuccessMessage(null)}
                />
              )}

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
                  message="Too many failed attempts. Please request a new code."
                  type="error"
                />
              )}

              {/* API / Invalid OTP Error Banner */}
              {activeError && !isBlocked && (
                <AuthErrorMessage
                  message={activeError}
                  type="error"
                  onRetry={activeError.includes('Network') ? handleVerify : undefined}
                />
              )}

              {/* Verify CTA */}
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleVerify}
                loading={isVerifying}
                disabled={otpValue.length !== 6 || isVerifying || isBlocked}
                style={styles.submitButton}
              >
                Verify & Continue
              </AppButton>

              {/* Expiry Notice */}
              <View style={styles.noticeSection}>
                <AppText variant="caption" color={Colors.textSecondary} center>
                  {isPhone
                    ? 'SMS OTP delivered to your mobile carrier.'
                    : "Didn't receive the email? Check your spam folder."}
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

            {/* Alternative navigation */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => router.replace(isPhone ? '/(auth)/login' : '/(auth)/register')}
                accessibilityRole="button"
                accessibilityLabel="Use a different method"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="bodySmall" weight="semiBold" color={Colors.cyanBlue} center>
                  {isPhone ? 'Use a different phone number' : 'Use a different email address'}
                </AppText>
              </TouchableOpacity>
            </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  resendSection: {
    alignItems: 'center',
    marginTop: -Spacing.xs,
  },
  cooldownBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.2)',
  },
  submitButton: {
    marginTop: Spacing.xs,
    shadowColor: Colors.cyanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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
