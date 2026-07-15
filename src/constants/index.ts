import Constants from 'expo-constants';

// ─── API ─────────────────────────────────────────────────────────────────────
// Override at runtime with EXPO_PUBLIC_API_BASE_URL in your .env file.
// Examples:
//   • iOS Simulator / Android Emulator (backend on the dev machine):
//       http://localhost:5000/api
//   • Physical device (backend on the dev machine): use its LAN IP, e.g.
//       http://192.168.1.220:5000/api
export const BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ??
  'http://localhost:5000/api';

// ─── AsyncStorage keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER: '@user',
  PERSIST_ROOT: '@persist_root',
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// ─── Image upload ─────────────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export const RAZORPAY_CURRENCY = 'INR';

// ─── Order statuses ───────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  'processing',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ─── Payment methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ['razorpay', 'cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ─── Sort options ─────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-rating' },
] as const;

// ─── Rating labels ────────────────────────────────────────────────────────────
export const RATING_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
