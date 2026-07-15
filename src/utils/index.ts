import { Product } from '@models/index';

// ─── Currency ─────────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Discount ─────────────────────────────────────────────────────────────────
export const getDiscountPercent = (price: number, discountPrice: number): number => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const getEffectivePrice = (product: Product): number => {
  return product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
};

// ─── Date ─────────────────────────────────────────────────────────────────────
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── String ───────────────────────────────────────────────────────────────────
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;

// ─── Order status color ───────────────────────────────────────────────────────
export const getOrderStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    processing: '#F39C12',
    confirmed: '#3498DB',
    shipped: '#9B59B6',
    delivered: '#27AE60',
    cancelled: '#E74C3C',
  };
  return map[status] ?? '#666';
};

// ─── Payment status color ─────────────────────────────────────────────────────
export const getPaymentStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: '#F39C12',
    paid: '#27AE60',
    failed: '#E74C3C',
  };
  return map[status] ?? '#666';
};

// ─── Error extractor ──────────────────────────────────────────────────────────
export const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if ('data' in e && typeof e.data === 'object' && e.data !== null) {
      const data = e.data as Record<string, unknown>;
      if (typeof data.message === 'string') return data.message;
    }
    if ('message' in e && typeof e.message === 'string') return e.message;
    if ('error' in e && typeof e.error === 'string') return e.error;
  }
  return 'Something went wrong. Please try again.';
};

// ─── Cart total ───────────────────────────────────────────────────────────────
export const calculateCartTotal = (
  items: Array<{ product: Product; quantity: number }>
): number => {
  return items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
    0
  );
};
