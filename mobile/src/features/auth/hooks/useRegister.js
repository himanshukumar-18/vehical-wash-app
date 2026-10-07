import { useState, useCallback } from 'react';

import { useRegisterMutation } from '../authApi';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * useRegister
 *
 * Handles new account registration:
 *  1. POST /api/auth/register/ → { fullname, email, password, phone? }
 *  2. Response 201: { success: true, message: "...", data: { email } }
 *  3. OTP is sent to the user's email by the backend.
 *  4. Call onSuccess(email) → navigate to OTP verification screen.
 *
 * @returns {{ submit, isLoading, apiError, clearError }}
 */
export const useRegister = () => {
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [apiError, setApiError] = useState(null);

  const submit = useCallback(
    async (formData, { onSuccess } = {}) => {
      setApiError(null);

      try {
        const payload = {
          fullname: formData.fullname.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          ...(formData.phone && formData.phone.trim()
            ? { phone: formData.phone.trim() }
            : {}),
        };

        const res = await registerMutation(payload).unwrap();

        // On success: OTP is being sent to formData.email by the backend.
        const registeredEmail =
          res.data?.email ||
          res.email ||
          formData.email.toLowerCase().trim();

        onSuccess?.(registeredEmail);
      } catch (err) {
        setApiError(getAuthErrorMessage(err));
      }
    },
    [registerMutation],
  );

  return {
    submit,
    isLoading,
    apiError,
    clearError: () => setApiError(null),
  };
};

export default useRegister;
