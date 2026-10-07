/**
 * Bookings API — Local Stub
 *
 * There is currently no backend booking endpoint.
 * All bookings are coordinated via WhatsApp (see src/constants/contact.js).
 *
 * This stub provides `useGetBookingsQuery` so that profile/history components
 * render gracefully without network failures or missing imports.
 */
import { baseApi } from '@/store/api/baseApi';

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      queryFn: () => ({ data: [] }),
      providesTags: [],
    }),
  }),
  overrideExisting: true,
});

export const { useGetBookingsQuery } = bookingsApi;
