import { baseApi } from './baseApi';
import type { ApiResponse, Wishlist } from '@models/index';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /wishlist
    getWishlist: builder.query<ApiResponse<{ wishlist: Wishlist }>, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    // POST /wishlist/:productId
    addToWishlist: builder.mutation<ApiResponse<{ wishlist: Wishlist }>, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // DELETE /wishlist/:productId
    removeFromWishlist: builder.mutation<ApiResponse<{ wishlist: Wishlist }>, string>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
