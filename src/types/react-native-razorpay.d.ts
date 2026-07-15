declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    key: string;
    amount: string | number;
    currency?: string;
    name?: string;
    description?: string;
    image?: string;
    order_id?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
      hide_topbar?: boolean;
    };
    modal?: {
      backdropclose?: boolean;
      escape?: boolean;
      handleback?: boolean;
      confirm_close?: boolean;
      ondismiss?: () => void;
      animation?: boolean;
    };
    [key: string]: any;
  }

  export interface PaymentSuccessData {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    [key: string]: any;
  }

  export interface PaymentErrorData {
    code: number;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
      [key: string]: any;
    };
  }

  class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<PaymentSuccessData>;
    static onExternalWalletSelection(callback: (data: { external_wallet: string }) => void): void;
  }

  export default RazorpayCheckout;
}
