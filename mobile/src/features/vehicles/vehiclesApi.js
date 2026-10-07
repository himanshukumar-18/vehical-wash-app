import { baseApi } from '@/store/api/baseApi';

/**
 * Vehicles API endpoints.
 * Requires JWT authentication (automatically injected by baseApi).
 * Backend URLs:
 * - GET    /api/vehicles/
 * - POST   /api/vehicles/
 * - GET    /api/vehicles/<id>/
 * - PATCH  /api/vehicles/<id>/
 * - DELETE /api/vehicles/<id>/
 */
export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/vehicles/
     * Returns list of vehicles owned by authenticated user.
     */
    getVehicles: builder.query({
      query: () => 'vehicles/',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.results)) return response.results;
        return [];
      },
      providesTags: (result) => {
        const list = Array.isArray(result) ? result : [];
        return [
          ...list.map(({ id }) => ({ type: 'Vehicles', id })),
          { type: 'Vehicles', id: 'LIST' },
        ];
      },
    }),

    /**
     * POST /api/vehicles/
     * Body: { brand, model, vehicle_type, registration_number, is_default }
     */
    addVehicle: builder.mutation({
      query: (data) => ({
        url: 'vehicles/',
        method: 'POST',
        body: {
          brand: data.brand.trim(),
          model: data.model.trim(),
          vehicle_type: data.vehicle_type || 'hatchback',
          registration_number: data.registration_number.trim().toUpperCase(),
          is_default: Boolean(data.is_default),
        },
      }),
      invalidatesTags: ['Vehicles', { type: 'Vehicles', id: 'LIST' }],
    }),

    /**
     * PATCH /api/vehicles/{id}/
     * Body: partial vehicle update
     */
    updateVehicle: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `vehicles/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Vehicles',
        { type: 'Vehicles', id },
        { type: 'Vehicles', id: 'LIST' },
      ],
    }),

    /**
     * DELETE /api/vehicles/{id}/
     */
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `vehicles/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicles', { type: 'Vehicles', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetVehiclesQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehiclesApi;
