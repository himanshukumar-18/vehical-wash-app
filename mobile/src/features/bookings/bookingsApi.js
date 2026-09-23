import { baseApi } from '@/store/api/baseApi';

/**
 * Bookings API endpoints.
 * Requires JWT authentication.
 */
export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/bookings/
     * Returns the current customer's booking history with optional status filter.
     */
    getBookings: builder.query({
      query: (params) => ({
        url: 'bookings/',
        params: params?.status ? { status: params.status } : undefined,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) => {
        const list = Array.isArray(result)
          ? result
          : result && Array.isArray(result.results)
          ? result.results
          : [];
        return [
          ...list.map(({ id }) => ({ type: 'Bookings', id })),
          { type: 'Bookings', id: 'LIST' },
        ];
      },
    }),

    /**
     * GET /api/bookings/{id}/
     */
    getBooking: builder.query({
      query: (id) => `bookings/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Bookings', id }],
    }),

    /**
     * POST /api/bookings/
     * Registers a new doorstep wash booking.
     */
    createBooking: builder.mutation({
      query: (data) => ({
        url: 'bookings/',
        method: 'POST',
        body: {
          vehicle_id: data.vehicle_id,
          service_id: data.service_id,
          booking_date: data.booking_date,
          address: data.address,
          customer_note: data.customer_note || '',
        },
      }),
      invalidatesTags: [{ type: 'Bookings', id: 'LIST' }],
    }),

    /**
     * POST /api/bookings/price-preview/
     */
    previewPrice: builder.mutation({
      query: (data) => ({
        url: 'bookings/price-preview/',
        method: 'POST',
        body: {
          service_id: data.service_id,
          address: data.address || '',
          booking_date: data.booking_date,
        },
      }),
    }),

    /**
     * POST /api/bookings/{id}/cancel/
     */
    cancelBooking: builder.mutation({
      query: ({ id, reason = 'Cancelled by customer' }) => ({
        url: `bookings/${id}/cancel/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bookings', id },
        { type: 'Bookings', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  usePreviewPriceMutation,
  useCancelBookingMutation,
} = bookingsApi;
