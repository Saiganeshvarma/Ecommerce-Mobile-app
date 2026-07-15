import { baseApi } from './baseApi';
import type { ApiResponse, Category } from '@models/index';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /categories
    getCategories: builder.query<ApiResponse<{ count: number; categories: Category[] }>, void>({
      query: () => '/categories',
      providesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // GET /categories/:id
    getCategoryById: builder.query<ApiResponse<{ category: Category }>, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Categories', id }],
    }),

    // POST /categories (Admin)
    createCategory: builder.mutation<ApiResponse<{ category: Category }>, FormData>({
      query: (formData) => ({
        url: '/categories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // PUT /categories/:id (Admin)
    updateCategory: builder.mutation<
      ApiResponse<{ category: Category }>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Categories', id }, { type: 'Categories', id: 'LIST' }],
    }),

    // DELETE /categories/:id (Admin)
    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
