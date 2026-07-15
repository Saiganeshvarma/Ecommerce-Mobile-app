import { baseApi } from './baseApi';
import type { ApiResponse, Cart } from '@models/index';

/**
 * Normalize the backend cart response.
 * The backend returns `products` for cart items, but the app model uses `items`.
 * This transform runs on every cart response so the rest of the app never changes.
 */
const normalizeCart = (response: ApiResponse<{ cart: any }>): ApiResponse<{ cart: Cart }> => {
  const raw = response?.data?.cart;
  if (raw && Array.isArray(raw.products) && !Array.isArray(raw.items)) {
    return {
      ...response,
      data: {
        cart: {
          ...raw,
          items: raw.products,   // rename products → items
        } as Cart,
      },
    };
  }
  return response as ApiResponse<{ cart: Cart }>;
};

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /cart
    getCart: builder.query<ApiResponse<{ cart: Cart }>, void>({
      query: () => '/cart',
      transformResponse: normalizeCart,
      providesTags: ['Cart'],
    }),

    // POST /cart
    addToCart: builder.mutation<
      ApiResponse<{ cart: Cart }>,
      { productId: string; quantity: number }
    >({
      query: (body) => ({ url: '/cart', method: 'POST', body }),
      transformResponse: normalizeCart,
      invalidatesTags: ['Cart'],
    }),

    // PUT /cart/:productId
    updateCartItem: builder.mutation<
      ApiResponse<{ cart: Cart }>,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/cart/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      transformResponse: normalizeCart,
      invalidatesTags: ['Cart'],
    }),

    // DELETE /cart/:productId
    removeFromCart: builder.mutation<ApiResponse<{ cart: Cart }>, string>({
      query: (productId) => ({ url: `/cart/${productId}`, method: 'DELETE' }),
      transformResponse: normalizeCart,
      invalidatesTags: ['Cart'],
    }),

    // DELETE /cart/clear
    clearCart: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/cart/clear', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
