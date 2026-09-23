import { baseApi } from '@/store/api/baseApi';

/**
 * Vehicles API endpoints.
 * Requires JWT authentication.
 */
export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/vehicles/
     * Returns list of vehicles owned by current customer.
     */
    getVehicles: builder.query({
      query: () => 'vehicles/',
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
          ...list.map(({ id }) => ({ type: 'Vehicles', id })),
          { type: 'Vehicles', id: 'LIST' },
        ];
      },
    }),

    /**
     * POST /api/vehicles/
     * Registers a new vehicle in customer's garage.
     */
    addVehicle: builder.mutation({
      query: (data) => ({
        url: 'vehicles/',
        method: 'POST',
        body: {
          brand: data.brand,
          model: data.model,
          color: data.color || '',
          vehicle_type: data.vehicle_type || 'hatchback',
          registration_number: data.registration_number,
          is_default: data.is_default ?? false,
        },
      }),
      invalidatesTags: [{ type: 'Vehicles', id: 'LIST' }],
    }),

    /**
     * PATCH /api/vehicles/{id}/
     */
    updateVehicle: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `vehicles/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
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
      invalidatesTags: [{ type: 'Vehicles', id: 'LIST' }],
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
