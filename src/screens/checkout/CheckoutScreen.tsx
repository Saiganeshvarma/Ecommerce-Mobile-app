import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList, PaymentMethod, Address } from '@models/index';
import { useGetCartQuery } from '@api/cartApi';
import { useGetAddressesQuery } from '@api/addressApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '@api/orderApi';
import { setCartItemCount } from '@redux/slices/cartSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useToast } from '@hooks/useToast';
import { useAuth } from '@hooks/useAuth';
import { extractErrorMessage, formatCurrency, getEffectivePrice } from '@utils/index';
import { RazorpayService } from '@services/razorpay.service';
import AppButton from '@components/common/AppButton';
import LoadingScreen from '@components/common/LoadingScreen';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<CartStackParamList>;

const CheckoutScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { data: cartData, isLoading: loadingCart } = useGetCartQuery();
  const { data: addrData, isLoading: loadingAddr } = useGetAddressesQuery();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: verifying }] = useVerifyPaymentMutation();

  const isLoading = creatingOrder || verifying || paymentProcessing;

  const cart = cartData?.data?.cart;
  const cartItems = (cart as any)?.items ?? (cart as any)?.products ?? [];
  const addresses = addrData?.data?.addresses ?? [];
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const activeAddressId = selectedAddressId ?? defaultAddr?._id ?? null;

  // Use the backend-computed totalPrice when product objects aren't populated,
  // and fall back to client-side calculation when they are.
  const subtotal = (() => {
    if (!cartItems.length) return 0;
    const clientTotal = cartItems.reduce((sum: number, item: any) => {
      const product = item.product;
      // product may be a bare ID string if not populated — skip client calc
      if (!product || typeof product !== 'object') return sum;
      const price =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price ?? 0;
      return sum + price * (item.quantity ?? 1);
    }, 0);
    // If client calc yielded 0 but items exist, trust backend totalPrice
    return clientTotal > 0 ? clientTotal : ((cart as any)?.totalPrice ?? 0);
  })();

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      showError('Please select a delivery address');
      return;
    }
    try {
      const res = await createOrder({ addressId: activeAddressId, paymentMethod }).unwrap();

      if (paymentMethod === 'cod') {
        // Cash on delivery — order is placed immediately
        dispatch(setCartItemCount(0));
        showSuccess('Order placed successfully!');
        navigation.replace('OrderSuccess', { orderId: res.data.order._id });
      } else {
        // Razorpay online payment
        const razorpayData = res.data.razorpay;
        if (!razorpayData) {
          showError('Payment gateway error. Please try again or use Cash on Delivery.');
          return;
        }

        setPaymentProcessing(true);
        try {
          // Try opening the native Razorpay SDK.
          // In Expo Go the SDK is unavailable — we catch that and simulate a
          // successful payment so the full order flow can be tested without a
          // custom build. The simulation never runs in production builds because
          // the real native module loads there.
          let paymentResult: Awaited<ReturnType<typeof RazorpayService.openCheckout>>;
          let isSimulated = false;

          try {
            paymentResult = await RazorpayService.openCheckout({
              razorpayData,
              name: 'EcommerceApp',
              description: `Order #${res.data.order._id.slice(-8).toUpperCase()}`,
              prefill: {
                name: user?.name,
                email: user?.email,
                contact: user?.phone,
              },
            });
          } catch (sdkErr: any) {
            const isNotAvailable =
              typeof sdkErr?.message === 'string' &&
              (sdkErr.message.includes('not available in Expo Go') ||
                sdkErr.message.includes('Razorpay is not available'));

            if (isNotAvailable) {
              // Simulate payment result for Expo Go dev testing
              isSimulated = true;
              paymentResult = {
                razorpayPaymentId: `pay_SIMULATED_${Date.now()}`,
                razorpayOrderId: razorpayData.orderId,
                razorpaySignature: 'simulated_signature',
              };
            } else {
              throw sdkErr; // Real SDK error — let outer catch handle it
            }
          }

          // Skip backend signature verification in Expo Go simulation mode
          // (backend would reject the fake signature). Real builds always verify.
          if (!isSimulated) {
            await verifyPayment({
              razorpayOrderId: paymentResult.razorpayOrderId,
              razorpayPaymentId: paymentResult.razorpayPaymentId,
              razorpaySignature: paymentResult.razorpaySignature,
              orderId: res.data.order._id,
            }).unwrap();
          }

          dispatch(setCartItemCount(0));
          showSuccess(isSimulated ? 'Order placed! (Simulated payment — Expo Go)' : 'Payment successful! Order confirmed.');
          navigation.replace('OrderSuccess', { orderId: res.data.order._id });
        } catch (paymentErr: any) {
          const isUserCancelled =
            paymentErr?.code === 0 ||
            paymentErr?.description?.toLowerCase()?.includes('cancel') ||
            paymentErr?.reason === 'payment_cancelled';

          if (isUserCancelled) {
            Alert.alert(
              'Payment Cancelled',
              'Your order was created but payment was not completed. You can retry payment from your orders.',
              [{ text: 'OK' }]
            );
          } else {
            showError(
              extractErrorMessage(paymentErr) || 'Payment failed. Please try again.'
            );
          }
        } finally {
          setPaymentProcessing(false);
        }
      }
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  if (loadingCart || loadingAddr) return <LoadingScreen />;

  const renderAddress = (addr: Address) => (
    <TouchableOpacity
      key={addr._id}
      style={[styles.addrCard, activeAddressId === addr._id && styles.addrCardSelected]}
      onPress={() => setSelectedAddressId(addr._id)}
    >
      <View style={styles.addrRadio}>
        <View style={[styles.radioOuter, activeAddressId === addr._id && styles.radioSelected]}>
          {activeAddressId === addr._id && <View style={styles.radioInner} />}
        </View>
      </View>
      <View style={styles.addrDetails}>
        <View style={styles.addrNameRow}>
          <Text style={styles.addrName}>{addr.fullName}</Text>
          {addr.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.addrLine}>{addr.houseNo}, {addr.street}</Text>
        <Text style={styles.addrLine}>{addr.city}, {addr.state} – {addr.pincode}</Text>
        <Text style={styles.addrLine}>{addr.country}</Text>
        <Text style={styles.addrPhone}>📞 {addr.mobile}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => {
              // CartStack's parent is MainTabs — navigate directly to ProfileTab
              navigation.getParent()?.navigate('ProfileTab' as never, { screen: 'AddAddress' } as never);
            }}>
              <Text style={styles.addLink}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          {addresses.length === 0 ? (
            <Text style={styles.noAddr}>No saved addresses. Add one.</Text>
          ) : (
            addresses.map(renderAddress)
          )}
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {(['cod', 'razorpay'] as PaymentMethod[]).map((method) => (
            <TouchableOpacity
              key={method}
              style={[styles.payCard, paymentMethod === method && styles.payCardSelected]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={[styles.radioOuter, paymentMethod === method && styles.radioSelected]}>
                {paymentMethod === method && <View style={styles.radioInner} />}
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>
                  {method === 'cod' ? '💵 Cash on Delivery' : '📱 Razorpay (UPI / Card / Net Banking)'}
                </Text>
                {method === 'cod' && (
                  <Text style={styles.paySubtitle}>Pay when your order arrives</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item: any) => {
            const product = item.product;
            const isPopulated = product && typeof product === 'object';
            const name = isPopulated ? product.title : 'Product';
            const price = isPopulated
              ? (product.discountPrice && product.discountPrice < product.price
                  ? product.discountPrice
                  : product.price ?? 0)
              : 0;
            return (
              <View key={isPopulated ? product._id : item._id ?? Math.random()} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>{name}</Text>
                <Text style={styles.orderItemQty}>× {item.quantity}</Text>
                <Text style={styles.orderItemPrice}>
                  {formatCurrency(price * item.quantity)}
                </Text>
              </View>
            );
          })}
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <AppButton
          title={paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
          onPress={handlePlaceOrder}
          loading={isLoading}
          size="lg"
          style={styles.placeBtn}
          fullWidth={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  section: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  addLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  noAddr: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.base },
  addrCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addrCardSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  addrRadio: { marginRight: Spacing.md, justifyContent: 'center' },
  addrDetails: { flex: 1 },
  addrNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  addrName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  defaultBadge: {
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },
  addrLine: { fontSize: FontSize.sm, color: Colors.textSecondary },
  addrPhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  payCardSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  payInfo: { flex: 1 },
  payTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  paySubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderItemName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  orderItemQty: { fontSize: FontSize.sm, color: Colors.textSecondary, marginHorizontal: Spacing.sm },
  orderItemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
    ...Shadow.lg,
  },
  footerTotal: { flex: 1 },
  footerLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  footerValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  placeBtn: { flex: 1 },
});

export default CheckoutScreen;
