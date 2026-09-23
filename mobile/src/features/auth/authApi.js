import { baseApi } from '@/store/api/baseApi';

/**
 * Auth API endpoints — injected into baseApi.
 *
 * All endpoints are verified against the actual Django backend source code.
 * Endpoint: POST /api/auth/register/   → { fullname, email, password }
 * Endpoint: POST /api/auth/login/      → { email, password } → { access, refresh }
 * Endpoint: POST /api/auth/verify-otp/ → { email, otp } → { success, message }
 * Endpoint: POST /api/auth/logout/     → { refresh } (requires Bearer token)
 * Endpoint: POST /api/auth/token/refresh/ → { refresh } → { access, refresh }
 * Endpoint: GET  /api/auth/profile/    → { id, fullname, email, role }
 *
 * NOTE: resend-otp does NOT exist in the backend. Do not add it.
 * NOTE: OTP verify does NOT return JWT tokens. User must login separately.
 * NOTE: Login uses SimpleJWT TokenObtainPair — returns { access, refresh } directly.
 * NOTE: Token refresh returns BOTH new access AND new refresh (ROTATE_REFRESH_TOKENS=True).
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/auth/register/
     * Body: { fullname, email, password }
     * Response 201: { id, fullname, email }
     * NOTE: Does NOT authenticate. OTP is sent via email. User must verify then login.
     */
    register: builder.mutation({
      query: (data) => ({
        url: 'auth/register/',
        method: 'POST',
        body: { fullname: data.fullname, email: data.email, password: data.password },
      }),
    }),

    /**
     * POST /api/auth/verify-otp/
     * Body: { email, otp }  — otp is a 6-digit numeric string
     * Response 200: { success: true, message: "Email verified successfully." }
     * Response 400: { success: false, message: "Invalid OTP code.", code: "INVALID_OTP" }
     * Response 429: { success: false, message: "Too many...", code: "RATE_LIMIT_EXCEEDED" }
     */
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: 'auth/verify-otp/',
        method: 'POST',
        body: { email: data.email, otp: data.otp },
      }),
    }),

    /**
     * POST /api/auth/login/
     * Body: { email, password }
     * Response 200: { access, refresh }  — direct SimpleJWT response, no wrapping
     * Response 400: VALIDATION_ERROR if email unverified or credentials invalid
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: { email: credentials.email, password: credentials.password },
      }),
    }),

    /**
     * POST /api/auth/logout/
     * Body: { refresh }
     * Requires: Authorization: Bearer <access_token>
     * Response 205: { success: true, message: "Successfully logged out." }
     */
    logout: builder.mutation({
      query: (data) => ({
        url: 'auth/logout/',
        method: 'POST',
        body: { refresh: data.refresh },
      }),
    }),

    /**
     * POST /api/auth/token/refresh/
     * Body: { refresh }
     * Response 200: { access, refresh }  — both tokens rotated
     */
    refreshToken: builder.mutation({
      query: (data) => ({
        url: 'auth/token/refresh/',
        method: 'POST',
        body: { refresh: data.refresh },
      }),
    }),

    /**
     * GET /api/auth/profile/
     * Response 200: { id, fullname, email, role }
     */
    getProfile: builder.query({
      query: () => 'auth/profile/',
      providesTags: ['Profile'],
    }),

    /**
     * PATCH /api/auth/profile/
     * Body: { fullname?, email? }
     */
    updateProfile: builder.mutation({
      query: (data) => ({
        url: 'auth/profile/',
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
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
