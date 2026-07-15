/**
 * Mock for react-native-razorpay.
 * Used in Expo Go where native modules are not available.
 * The real module requires a custom dev build (expo run:android / eas build).
 */
'use strict';

class RazorpayCheckout {
  static open(_options) {
    return Promise.reject(
      new Error(
        'Razorpay is not available in Expo Go. Use a custom dev build (expo run:android) to test online payments.'
      )
    );
  }

  static onExternalWalletSelection(_cb) {}
}

export default RazorpayCheckout;
