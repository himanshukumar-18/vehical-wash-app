import { z } from 'zod';

/**
 * Zod validation schema for the Register form.
 * Backend: POST /api/auth/register/ — { fullname, email, password, phone? }
 * confirmPassword is client-side only — never sent to backend.
 */
export const registerSchema = z
  .object({
    fullname: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .transform((v) => v.toLowerCase().trim()),
    phone: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val || !val.trim()) return true;
          const digits = val.replace(/\D/g, '');
          return digits.length === 10 || (val.startsWith('+91') && digits.length === 12);
        },
        { message: 'Enter a valid 10-digit mobile number' }
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
