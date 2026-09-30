import { baseApi } from '@/store/api/baseApi';

/**
 * Services API endpoints.
 * Public endpoints for fetching car wash service catalog.
 */
export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/services/
     * Returns list of active bookable services.
     */
    getServices: builder.query({
      query: () => 'services/',
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
          ...list.map(({ id, slug }) => ({ type: 'Services', id: id || slug })),
          { type: 'Services', id: 'LIST' },
        ];
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetServicesQuery } = servicesApi;
