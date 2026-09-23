import { useState, useCallback } from 'react';

import { useVerifyOtpMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * useOtpVerify
 *
 * Handles OTP verification:
 *  1. POST /api/auth/verify-otp/ → { email, otp }
 *  2. Response 200: { success: true, message: "Email verified successfully." }
 *  3. Does NOT return tokens — user must log in after verification.
 *
 * Tracks failed attempts locally to show warning before backend enforces limit (5 max).
 *
 * @returns {{ submit, isLoading, apiError, clearError, failedAttempts }}
 */
export const useOtpVerify = () => {
  const [verifyOtpMutation, { isLoading }] = useVerifyOtpMutation();
  const [apiError, setApiError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const submit = useCallback(
    async ({ email, otp }, { onSuccess } = {}) => {
      setApiError(null);

      try {
        await verifyOtpMutation({ email, otp }).unwrap();
        // Success — OTP verified. Navigate to login screen.
        // Tokens are NOT returned here; the user must call /api/auth/login/ next.
        onSuccess?.();
      } catch (err) {
        setFailedAttempts((prev) => prev + 1);
        setApiError(getAuthErrorMessage(err));
      }
    },
    [verifyOtpMutation],
  );

  return {
    submit,
    isLoading,
    apiError,
    clearError: () => setApiError(null),
    failedAttempts,
  };
};
