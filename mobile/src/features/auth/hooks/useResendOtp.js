import { useState, useCallback, useRef, useEffect } from 'react';

import { useResendOtpMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * useResendOtp
 *
 * Handles OTP resend with local countdown cooldown:
 *  1. POST /api/auth/resend-otp/ → { email }
 *  2. 60-second cooldown timer to prevent spamming
 *
 * @param {number} cooldownDuration - Seconds to wait before allowing another resend (default 60)
 * @returns {{ resend, isLoading, apiError, clearError, cooldownSeconds, canResend }}
 */
export const useResendOtp = (cooldownDuration = 60) => {
  const [resendOtpMutation, { isLoading }] = useResendOtpMutation();
  const [apiError, setApiError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const timerRef = useRef(null);

  const startCooldown = useCallback(() => {
    setCooldownSeconds(cooldownDuration);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownDuration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resend = useCallback(
    async ({ email }, { onSuccess } = {}) => {
      if (cooldownSeconds > 0 || isLoading) return;
      setApiError(null);

      try {
        await resendOtpMutation({ email: email.toLowerCase().trim() }).unwrap();
        startCooldown();
        onSuccess?.();
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      }
    },
    [resendOtpMutation, cooldownSeconds, isLoading, startCooldown],
  );

  return {
    resend,
    isLoading,
    apiError,
    clearError: () => setApiError(null),
    cooldownSeconds,
    canResend: cooldownSeconds === 0 && !isLoading,
  };
};

export default useResendOtp;
