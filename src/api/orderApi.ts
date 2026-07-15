import { baseApi } from './baseApi';
import type { ApiResponse, Order, Pagination, RazorpayOrderData, PaymentMethod } from '@models/index';

interface CreateOrderResponse {
  order: Order;
  razorpay?: RazorpayOrderData;
}

interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

/**
 * Backend Order model uses `products` for order items and `address` as an
 * embedded object. Normalize `products` → `items` so the app model is consistent.
 */
const normalizeOrder = (raw: any): Order => {
  if (!raw) return raw;
  return {
    ...raw,
    // rename products → items if needed
    items: raw.items ?? raw.products ?? [],
  };
};

const normalizeOrderResponse = (
  response: ApiResponse<{ order: any }>
): ApiResponse<{ order: Order }> => ({
  ...response,
  data: { ...response.data, order: normalizeOrder(response.data?.order) },
});

const normalizeOrdersResponse = (
  response: ApiResponse<{ orders: any[]; pagination: Pagination }>
): ApiResponse<OrdersResponse> => ({
  ...response,
  data: {
    ...response.data,
    orders: (response.data?.orders ?? []).map(normalizeOrder),
  },
});

const normalizeCreateOrderResponse = (
  response: ApiResponse<{ order: any; razorpay?: RazorpayOrderData }>
): ApiResponse<CreateOrderResponse> => ({
  ...response,
  data: {
    ...response.data,
    order: normalizeOrder(response.data?.order),
  },
});

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /orders
    createOrder: builder.mutation<
      ApiResponse<CreateOrderResponse>,
      { addressId: string; paymentMethod: PaymentMethod }
    >({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: normalizeCreateOrderResponse,
      invalidatesTags: ['Orders', 'Cart'],
    }),

    // POST /payment/verify
    verifyPayment: builder.mutation<
      ApiResponse<{ order: Order }>,
      {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        orderId: string;
      }
    >({
      query: (body) => ({ url: '/payment/verify', method: 'POST', body }),
      transformResponse: normalizeOrderResponse,
      invalidatesTags: ['Orders'],
    }),

    // GET /orders
    getOrders: builder.query<ApiResponse<OrdersResponse>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/orders', params: params ?? {} }),
      transformResponse: normalizeOrdersResponse,
      providesTags: [{ type: 'Orders', id: 'LIST' }],
    }),

    // GET /orders/:id
    getOrderById: builder.query<ApiResponse<{ order: Order }>, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: normalizeOrderResponse,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),

    // PUT /orders/:id/cancel
    cancelOrder: builder.mutation<ApiResponse<{ order: Order }>, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PUT' }),
      transformResponse: normalizeOrderResponse,
      invalidatesTags: (_r, _e, id) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} = orderApi;
