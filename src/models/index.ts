import type { OrderStatus, PaymentMethod } from '@constants/index';
export type { OrderStatus, PaymentMethod };

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Image ────────────────────────────────────────────────────────────────────
export interface ImageData {
  url: string;
  public_id?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified?: boolean;
  profileImage?: ImageData;
  createdAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthData {
  token: string;
  user: User;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: ImageData;
  createdAt?: string;
}

// ─── Specification ────────────────────────────────────────────────────────────
export interface Specification {
  key: string;
  value: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  brand: string;
  stock: number;
  featured: boolean;
  category: Category | string;
  images: ImageData[];
  specifications?: Specification[];
  rating?: number;
  numReviews?: number;
  createdAt?: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'profileImage'>;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

// ─── Address ──────────────────────────────────────────────────────────────────
export interface Address {
  _id: string;
  user: string;
  fullName: string;
  mobile: string;
  houseNo: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface Wishlist {
  _id: string;
  user: string;
  products: Product[];
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: OrderStatus;
  totalPrice: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export interface RazorpayOrderData {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Dashboard {
  stats: DashboardStats;
  monthlyRevenue: MonthlyRevenue[];
  topProducts: Product[];
  latestOrders: Order[];
}

// ─── Product filter params ────────────────────────────────────────────────────
export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  featured?: boolean;
}

// ─── Navigation param lists ───────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  WishlistTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  ProductList: { categoryId?: string; title?: string; search?: string };
  Search: undefined;
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  AddressList: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminUserDetail: { userId: string };
  AdminCategories: undefined;
  AdminAddCategory: undefined;
  AdminEditCategory: { categoryId: string };
  AdminProducts: undefined;
  AdminAddProduct: undefined;
  AdminEditProduct: { productId: string };
  AdminOrders: undefined;
  AdminOrderDetail: { orderId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};
