import { baseApi } from './baseApi';
import type { ApiResponse, Dashboard, User, Order, OrderStatus, Pagination } from '@models/index';

// Backend returns pagination object for list endpoints, not a plain count
interface AdminUsersResponse  { users: User[];  pagination: Pagination; count?: number }
interface AdminOrdersResponse { orders: Order[]; pagination: Pagination; count?: number }

/** Normalize order products → items */
const normalizeOrder = (raw: any): Order => ({
  ...raw,
  items: raw.items ?? raw.products ?? [],
});

const normalizeOrders = (resp: ApiResponse<any>): ApiResponse<AdminOrdersResponse> => ({
  ...resp,
  data: {
    ...resp.data,
    orders: (resp.data?.orders ?? []).map(normalizeOrder),
    pagination: resp.data?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false },
  },
});

const normalizeOrderResp = (resp: ApiResponse<any>): ApiResponse<{ order: Order }> => ({
  ...resp,
  data: { ...resp.data, order: normalizeOrder(resp.data?.order) },
});

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /admin/dashboard
    getDashboard: builder.query<ApiResponse<Dashboard>, void>({
      query: () => '/admin/dashboard',
      providesTags: ['AdminDashboard'],
    }),

    // GET /admin/users
    getAdminUsers: builder.query<ApiResponse<AdminUsersResponse>, { search?: string } | void>({
      query: (params) => ({ url: '/admin/users', params: params ?? {} }),
      providesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    // GET /admin/users/:id
    getAdminUserById: builder.query<ApiResponse<{ user: User }>, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AdminUsers', id }],
    }),

    // PUT /admin/users/:id
    updateAdminUser: builder.mutation<ApiResponse<{ user: User }>, { id: string; role: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    // DELETE /admin/users/:id
    deleteAdminUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    // GET /admin/orders
    getAdminOrders: builder.query<
      ApiResponse<AdminOrdersResponse>,
      { status?: OrderStatus; paymentStatus?: string } | void
    >({
      query: (params) => ({ url: '/admin/orders', params: params ?? {} }),
      transformResponse: normalizeOrders,
      providesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),

    // PUT /admin/orders/:id/status
    updateOrderStatus: builder.mutation<
      ApiResponse<{ order: Order }>,
      { id: string; orderStatus: OrderStatus }
    >({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/status`, method: 'PUT', body }),
      transformResponse: normalizeOrderResp,
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} = adminApi;
