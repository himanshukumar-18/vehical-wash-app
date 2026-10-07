import { baseApi } from '@/store/api/baseApi';

/**
 * Auth API endpoints — injected into baseApi.
 *
 * All endpoints verified against Django backend (users/urls.py):
 * - POST /api/auth/register/          → { fullname, email, password, phone? }
 * - POST /api/auth/login/             → { email, password }
 * - POST /api/auth/verify-otp/        → { email, otp }
 * - POST /api/auth/resend-otp/        → { email }
 * - POST /api/auth/phone/send-otp/    → { phone }
 * - POST /api/auth/phone/verify-otp/  → { phone, otp }
 * - POST /api/auth/google/            → { id_token }
 * - POST /api/auth/refresh/           → { refresh }
 * - POST /api/auth/logout/            → { refresh }
 * - GET  /api/auth/me/                → user profile
 * - PATCH /api/auth/me/               → { fullname?, phone? }
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/auth/register/
     * Body: { fullname, email, password, phone? }
     * Response 201: { success: true, message: "...", data: { email } }
     */
    register: builder.mutation({
      query: (data) => ({
        url: 'auth/register/',
        method: 'POST',
        body: {
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          ...(data.phone ? { phone: data.phone } : {}),
        },
      }),
    }),

    /**
     * POST /api/auth/login/
     * Body: { email, password }
     * Response 200: { success: true, message: "...", data: { tokens: { access, refresh }, user } }
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
    }),

    /**
     * POST /api/auth/verify-otp/
     * Body: { email, otp }
     * Response 200: { success: true, message: "Email verified successfully." }
     */
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: 'auth/verify-otp/',
        method: 'POST',
        body: {
          email: data.email,
          otp: data.otp,
        },
      }),
    }),

    /**
     * POST /api/auth/resend-otp/
     * Body: { identifier, purpose }
     * Accepts: { email } or { phone } or { identifier, purpose }
     */
    resendOtp: builder.mutation({
      query: (data) => ({
        url: 'auth/resend-otp/',
        method: 'POST',
        body: {
          identifier: (data.identifier || data.email || data.phone || '').trim().toLowerCase(),
          purpose: data.purpose || (data.phone ? 'phone_login' : 'email_verification'),
        },
      }),
    }),

    /**
     * POST /api/auth/phone/send-otp/
     * Body: { phone }
     * Response 200: { success: true, message: "OTP sent successfully." }
     */
    phoneSendOtp: builder.mutation({
      query: (data) => ({
        url: 'auth/phone/send-otp/',
        method: 'POST',
        body: {
          phone: data.phone,
        },
      }),
    }),

    /**
     * POST /api/auth/phone/verify-otp/
     * Body: { phone, otp }
     * Response 200: { success: true, message: "...", data: { tokens: { access, refresh }, user } }
     */
    phoneVerifyOtp: builder.mutation({
      query: (data) => ({
        url: 'auth/phone/verify-otp/',
        method: 'POST',
        body: {
          phone: data.phone,
          otp: data.otp,
        },
      }),
    }),

    /**
     * POST /api/auth/google/
     * Body: { id_token }
     * Response 200: { success: true, message: "...", data: { tokens: { access, refresh }, user } }
     */
    googleAuth: builder.mutation({
      query: (data) => ({
        url: 'auth/google/',
        method: 'POST',
        body: {
          id_token: data.id_token,
        },
      }),
    }),

    /**
     * POST /api/auth/refresh/
     * Body: { refresh }
     * Response 200: { access, refresh }
     */
    refreshToken: builder.mutation({
      query: (data) => ({
        url: 'auth/refresh/',
        method: 'POST',
        body: {
          refresh: data.refresh,
        },
      }),
    }),

    /**
     * POST /api/auth/logout/
     * Body: { refresh }
     * Response 200: { success: true, message: "Successfully logged out." }
     */
    logout: builder.mutation({
      query: (data) => ({
        url: 'auth/logout/',
        method: 'POST',
        body: {
          refresh: data.refresh,
        },
      }),
    }),

    /**
     * GET /api/auth/me/
     * Response 200: { id, fullname, email, phone, is_email_verified, is_phone_verified, date_joined }
     */
    getProfile: builder.query({
      query: () => 'auth/me/',
      providesTags: ['Profile'],
    }),

    /**
     * PATCH /api/auth/me/
     * Body: { fullname?, phone? }
     */
    updateProfile: builder.mutation({
      query: (data) => ({
        url: 'auth/me/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  usePhoneSendOtpMutation,
  usePhoneVerifyOtpMutation,
  useGoogleAuthMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
