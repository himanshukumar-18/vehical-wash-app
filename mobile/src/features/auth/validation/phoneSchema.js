import { z } from 'zod';

/**
 * Zod validation schema for Phone Number input.
 * Backend accepts 10-digit Indian numbers or E.164 formats (+91...).
 */
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .transform((val) => val.replace(/\s+/g, ''))
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 10 || (val.startsWith('+91') && digits.length === 12);
      },
      { message: 'Enter a valid 10-digit mobile number' }
    ),
});

export const phoneVerifySchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  fullname: z.string().max(100).optional(),
});
