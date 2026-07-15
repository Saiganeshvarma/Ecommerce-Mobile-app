import { baseApi } from './baseApi';
import type { ApiResponse, AuthData, User } from '@models/index';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/register
    register: builder.mutation<
      ApiResponse<AuthData>,
      { name: string; email: string; phone: string; password: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),

    // POST /auth/login
    login: builder.mutation<
      ApiResponse<AuthData>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),

    // GET /auth/me
    getMe: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // PUT /auth/profile (multipart/form-data)
    updateProfile: builder.mutation<ApiResponse<{ user: User }>, FormData>({
      query: (formData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // PUT /auth/change-password
    changePassword: builder.mutation<
      ApiResponse<null>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/auth/change-password', method: 'PUT', body }),
    }),

    // POST /auth/forgot-password
    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    // PUT /auth/reset-password/:token
    resetPassword: builder.mutation<
      ApiResponse<null>,
      { token: string; password: string }
    >({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'PUT',
        body: { password },
      }),
    }),

    // POST /auth/logout
    logoutApi: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutApiMutation,
} = authApi;
