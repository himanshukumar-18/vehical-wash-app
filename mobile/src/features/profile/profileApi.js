/**
 * Profile API exports.
 * Profile endpoints (GET/PATCH /api/auth/me/) are managed in authApi.
 */
export {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/auth/authApi';
