import { baseApi } from './baseApi';
import type { ApiResponse, Product, Pagination, ProductFilterParams } from '@models/index';

interface ProductsResponse {
  pagination: Pagination;
  products: Product[];
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /products
    getProducts: builder.query<ApiResponse<ProductsResponse>, ProductFilterParams>({
      query: (params) => ({
        url: '/products',
        params: { ...params },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.products.map(({ _id }) => ({
                type: 'Products' as const,
                id: _id,
              })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    // GET /products/featured
    getFeaturedProducts: builder.query<ApiResponse<{ products: Product[] }>, number | void>({
      query: (limit = 8) => ({ url: '/products/featured', params: { limit } }),
      providesTags: [{ type: 'Products', id: 'FEATURED' }],
    }),

    // GET /products/category/:categoryId
    getProductsByCategory: builder.query<
      ApiResponse<ProductsResponse>,
      { categoryId: string; params?: ProductFilterParams }
    >({
      query: ({ categoryId, params }) => ({
        url: `/products/category/${categoryId}`,
        params,
      }),
      providesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    // GET /products/:id
    getProductById: builder.query<ApiResponse<{ product: Product }>, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Products', id }],
    }),

    // GET /products/:id/related
    getRelatedProducts: builder.query<ApiResponse<{ products: Product[] }>, string>({
      query: (id) => `/products/${id}/related`,
      providesTags: [{ type: 'Products', id: 'RELATED' }],
    }),

    // POST /products (Admin)
    createProduct: builder.mutation<ApiResponse<{ product: Product }>, FormData>({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    // PUT /products/:id (Admin)
    updateProduct: builder.mutation<
      ApiResponse<{ product: Product }>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Products', id }],
    }),

    // DELETE /products/:id (Admin)
    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
