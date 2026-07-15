import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '@redux/store';
import { BASE_URL } from '@constants/index';
import { logout } from '@redux/slices/authSlice';

// ─── Base query with auth header ──────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// ─── Re-auth wrapper — auto logout on 401 ─────────────────────────────────────
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

// ─── Base API — all slice APIs inject into this ───────────────────────────────
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Products',
    'Categories',
    'Cart',
    'Wishlist',
    'Addresses',
    'Orders',
    'Reviews',
    'AdminUsers',
    'AdminOrders',
    'AdminDashboard',
  ],
  endpoints: () => ({}),
});
