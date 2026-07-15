import { baseApi } from './baseApi';
import type { ApiResponse, Review } from '@models/index';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /products/:id/reviews
    getReviews: builder.query<ApiResponse<{ reviews: Review[] }>, string>({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: (_r, _e, productId) => [{ type: 'Reviews', id: productId }],
    }),

    // POST /products/:id/reviews
    addReview: builder.mutation<
      ApiResponse<{ review: Review }>,
      { productId: string; rating: number; comment: string }
    >({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Reviews', id: productId },
        { type: 'Products', id: productId },
      ],
    }),

    // DELETE /products/:id/reviews/:reviewId
    deleteReview: builder.mutation<
      ApiResponse<null>,
      { productId: string; reviewId: string }
    >({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Reviews', id: productId },
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
