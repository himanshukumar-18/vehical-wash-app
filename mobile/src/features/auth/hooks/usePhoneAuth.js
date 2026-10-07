import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { saveTokens } from '@/services/storage/secureStorage';
import { setCredentials } from '../authSlice';
import { usePhoneSendOtpMutation, usePhoneVerifyOtpMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * usePhoneAuth
 *
 * Handles the complete Phone OTP authentication flow:
 * 1. sendOtp: POST /api/auth/phone/send-otp/
 * 2. verifyOtp: POST /api/auth/phone/verify-otp/ → receives JWT tokens + user → saves tokens & sets Redux state
 */
export const usePhoneAuth = () => {
  const dispatch = useDispatch();
  const [sendOtpMutation, { isLoading: isSending }] = usePhoneSendOtpMutation();
  const [verifyOtpMutation, { isLoading: isVerifying }] = usePhoneVerifyOtpMutation();

  const [apiError, setApiError] = useState(null);

  const sendOtp = useCallback(
    async ({ phone }, { onSuccess } = {}) => {
      setApiError(null);
      try {
        const cleanPhone = phone.trim();
        const formattedPhone = cleanPhone.startsWith('+')
          ? cleanPhone
          : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`;

        const res = await sendOtpMutation({ phone: formattedPhone }).unwrap();
        onSuccess?.(formattedPhone, res);
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      }
    },
    [sendOtpMutation],
  );

  const verifyOtp = useCallback(
    async ({ phone, otp, fullname }, { onSuccess } = {}) => {
      setApiError(null);
      try {
        const res = await verifyOtpMutation({
          phone: phone.trim(),
          otp: otp.trim(),
          ...(fullname && fullname.trim() ? { fullname: fullname.trim() } : {}),
        }).unwrap();

        const accessToken =
          res.data?.tokens?.access ||
          res.tokens?.access ||
          res.data?.access ||
          res.access;

        const refreshToken =
          res.data?.tokens?.refresh ||
          res.tokens?.refresh ||
          res.data?.refresh ||
          res.refresh;

        if (!accessToken) {
          throw new Error('Authentication failed. No access token returned.');
        }

        // Save tokens securely
        await saveTokens(accessToken, refreshToken || '');

        // Update Redux auth state
        const user = res.data?.user || res.user || { phone, fullname: fullname || '' };
        dispatch(setCredentials({ user }));

        onSuccess?.(user);
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      }
    },
    [verifyOtpMutation, dispatch],
  );

  return {
    sendOtp,
    verifyOtp,
    isLoading: isSending || isVerifying,
    isSending,
    isVerifying,
    apiError,
    clearError: () => setApiError(null),
  };
};

export default usePhoneAuth;
