/**
 * Services API — Local Catalog
 *
 * There is currently no backend services catalog endpoint.
 * Services are defined in src/constants/services.js.
 *
 * This query stub provides `useGetServicesQuery` returning the catalog
 * directly so HomeScreen and BookingScreen operate seamlessly.
 */
import { baseApi } from '@/store/api/baseApi';
import { FALLBACK_SERVICES } from '@/constants/services';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      queryFn: () => ({ data: FALLBACK_SERVICES }),
      providesTags: [{ type: 'Services', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetServicesQuery } = servicesApi;
