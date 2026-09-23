import { z } from 'zod';

/**
 * Zod validation schema for the OTP Verification form.
 * Backend: POST /api/auth/verify-otp/ — { email, otp }
 * OTP is a 6-digit numeric code (verified from backend source).
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});
