import { z } from 'zod';

/**
 * Zod validation schema for the Register form.
 * Backend: POST /api/auth/register/ — { fullname, email, password }
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
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
