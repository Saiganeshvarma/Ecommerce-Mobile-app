import { baseApi } from './baseApi';
import type { ApiResponse, Address } from '@models/index';
import type { AddressFormData } from '@validations/address.validation';

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /addresses
    getAddresses: builder.query<ApiResponse<{ addresses: Address[] }>, void>({
      query: () => '/addresses',
      providesTags: ['Addresses'],
    }),

    // POST /addresses
    createAddress: builder.mutation<ApiResponse<{ address: Address }>, AddressFormData>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: ['Addresses'],
    }),

    // PUT /addresses/:id
    updateAddress: builder.mutation<
      ApiResponse<{ address: Address }>,
      { id: string; data: AddressFormData }
    >({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Addresses'],
    }),

    // PUT /addresses/:id/default
    setDefaultAddress: builder.mutation<ApiResponse<{ address: Address }>, string>({
      query: (id) => ({ url: `/addresses/${id}/default`, method: 'PUT' }),
      invalidatesTags: ['Addresses'],
    }),

    // DELETE /addresses/:id
    deleteAddress: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
