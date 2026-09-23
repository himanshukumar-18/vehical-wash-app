/**
 * Profile API exports.
 * Profile endpoints (getProfile, updateProfile) are managed via authApi.
 */
export {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/auth/authApi';
