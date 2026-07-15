/**
 * Razorpay integration helper.
 *
 * Uses the real react-native-razorpay native module when running in a custom
 * dev build (expo run:android / expo run:ios / eas build).
 *
 * In Expo Go the native module is not available — we detect that at runtime via
 * expo-constants and surface a friendly error so CheckoutScreen can show the
 * "Razorpay Not Available" alert instead of crashing.
 */
import Constants from 'expo-constants';
import type { RazorpayOrderData } from '@models/index';

export interface RazorpayPaymentResult {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface RazorpayCheckoutOptions {
  razorpayData: RazorpayOrderData;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

/** Returns true when running inside Expo Go (no native modules available). */
const isExpoGo = (): boolean =>
  Constants.executionEnvironment === 'storeClient';

export const RazorpayService = {
  openCheckout: async (opts: RazorpayCheckoutOptions): Promise<RazorpayPaymentResult> => {
    if (isExpoGo()) {
      throw Object.assign(
        new Error('Razorpay is not available in Expo Go. Use a custom dev build (expo run:android) to test online payments.'),
        { message: 'not available in Expo Go' }
      );
    }

    // Dynamically require so the import doesn't crash at module-load time in
    // environments where the native module isn't linked (e.g. web).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RazorpayCheckout = require('react-native-razorpay').default;

    const { razorpayData, name = 'EcommerceApp', description = 'Order Payment', prefill } = opts;

    const options = {
      // Prefer the key returned by the backend; fall back to the env-var test key
      key: razorpayData.key || (process.env.EXPO_PUBLIC_RAZORPAY_KEY ?? ''),
      amount: String(razorpayData.amount),
      currency: razorpayData.currency ?? 'INR',
      order_id: razorpayData.orderId,
      name,
      description,
      prefill: {
        name: prefill?.name ?? '',
        email: prefill?.email ?? '',
        contact: prefill?.contact ?? '',
      },
      theme: { color: '#FF6B35' },
    };

    const data = await RazorpayCheckout.open(options);

    return {
      razorpayPaymentId: (data as any).razorpay_payment_id,
      razorpayOrderId: (data as any).razorpay_order_id ?? razorpayData.orderId,
      razorpaySignature: (data as any).razorpay_signature ?? '',
    };
  },
};
