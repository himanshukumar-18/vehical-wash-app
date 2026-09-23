import { z } from 'zod';

/**
 * Zod validation schema for the Login form.
 * Backend: POST /api/auth/login/ — { email, password }
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});
