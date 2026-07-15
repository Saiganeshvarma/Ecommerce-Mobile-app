import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '@models/index';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@api/orderApi';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import StatusBadge from '@components/common/StatusBadge';
import ConfirmModal from '@components/common/ConfirmModal';
import AppButton from '@components/common/AppButton';
import { formatCurrency, formatDateTime } from '@utils/index';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Route = RouteProp<ProfileStackParamList, 'OrderDetail'>;

const ORDER_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrderDetailScreen = () => {
  const route = useRoute<Route>();
  const { orderId } = route.params;
  const { showSuccess, showError } = useToast();
  const [cancelModal, setCancelModal] = useState(false);

  const { data, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  if (isLoading) return <LoadingScreen />;
  if (isError || !data?.data?.order) return <ErrorView onRetry={refetch} />;

  const order = data.data.order;
  const canCancel = order.orderStatus === 'processing' || order.orderStatus === 'confirmed';
  const stepIndex = ORDER_STEPS.indexOf(order.orderStatus);

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId).unwrap();
      showSuccess('Order cancelled successfully');
      setCancelModal(false);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{order._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placed on</Text>
            <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment</Text>
            <View style={styles.rowRight}>
              <StatusBadge status={order.paymentStatus} type="payment" />
              <Text style={styles.payMethod}>{order.paymentMethod.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Order tracker */}
        {order.orderStatus !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>
            <View style={styles.tracker}>
              {ORDER_STEPS.map((step, i) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]}>
                      {i <= stepIndex && <View style={styles.stepDotInner} />}
                    </View>
                    {i < ORDER_STEPS.length - 1 && (
                      <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, i <= stepIndex && styles.stepLabelActive]}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {order.orderStatus === 'cancelled' && (
          <View style={[styles.card, styles.cancelledCard]}>
            <Text style={styles.cancelledText}>❌ This order has been cancelled</Text>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Image source={{ uri: item.product?.images?.[0]?.url }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product?.title}</Text>
                <Text style={styles.itemBrand}>{item.product?.brand}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {typeof order.address === 'object' && (
            <>
              <Text style={styles.addrName}>{order.address.fullName}</Text>
              <Text style={styles.addrLine}>{order.address.houseNo}, {order.address.street}</Text>
              <Text style={styles.addrLine}>{order.address.city}, {order.address.state} – {order.address.pincode}</Text>
              <Text style={styles.addrLine}>{order.address.country}</Text>
              <Text style={styles.addrPhone}>📞 {order.address.mobile}</Text>
            </>
          )}
        </View>

        {/* Price breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatCurrency(order.totalPrice)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={[styles.value, { color: Colors.success }]}>FREE</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalPrice)}</Text>
          </View>
        </View>

        {/* Cancel button */}
        {canCancel && (
          <View style={styles.cancelSection}>
            <AppButton
              title="Cancel Order"
              onPress={() => setCancelModal(true)}
              variant="danger"
              size="lg"
            />
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <ConfirmModal
        visible={cancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
        loading={cancelling}
        destructive
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    margin: Spacing.sm,
    marginBottom: 0,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  payMethod: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tracker: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  stepLeft: { alignItems: 'center', marginRight: Spacing.md, width: 20 },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { borderColor: Colors.primary },
  stepDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  stepLine: { width: 2, height: 28, backgroundColor: Colors.border, marginVertical: 2 },
  stepLineActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: FontSize.sm, color: Colors.textMuted, paddingVertical: Spacing.xs },
  stepLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  cancelledCard: { backgroundColor: `${Colors.error}10`, borderWidth: 1, borderColor: Colors.error },
  cancelledText: { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.medium, textAlign: 'center' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: Spacing.sm,
  },
  itemImage: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.border },
  itemDetails: { flex: 1, marginHorizontal: Spacing.sm },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, lineHeight: 18 },
  itemBrand: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  itemTotal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  addrName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  addrLine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  addrPhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  cancelSection: { padding: Spacing.base },
});

export default OrderDetailScreen;
