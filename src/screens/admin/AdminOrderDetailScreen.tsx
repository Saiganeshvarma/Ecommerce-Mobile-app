import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AdminStackParamList, OrderStatus } from '@models/index';
import { useGetOrderByIdQuery } from '@api/orderApi';
import { useUpdateOrderStatusMutation } from '@api/adminApi';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import StatusBadge from '@components/common/StatusBadge';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage, formatCurrency, formatDateTime } from '@utils/index';
import { ORDER_STATUSES } from '@constants/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { getOrderStatusColor } from '@utils/index';

type Route = RouteProp<AdminStackParamList, 'AdminOrderDetail'>;

const AdminOrderDetailScreen = () => {
  const route = useRoute<Route>();
  const { orderId } = route.params;
  const { showSuccess, showError } = useToast();

  const { data, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId);
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  if (isLoading) return <LoadingScreen />;
  if (isError || !data?.data?.order) return <ErrorView onRetry={refetch} />;

  const order = data.data.order;

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      await updateStatus({ id: orderId, orderStatus: status }).unwrap();
      showSuccess(`Order status updated to ${status}`);
      refetch();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>#{order._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <View style={styles.rowRight}>
            <StatusBadge status={order.paymentStatus} type="payment" />
            <Text style={styles.payMethod}>{order.paymentMethod.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={[styles.value, { color: Colors.primary, fontWeight: FontWeight.bold }]}>
            {formatCurrency(order.totalPrice)}
          </Text>
        </View>
      </View>

      {/* Status updater */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Order Status</Text>
        <View style={styles.statusGrid}>
          {ORDER_STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                { borderColor: getOrderStatusColor(s) },
                order.orderStatus === s && { backgroundColor: getOrderStatusColor(s) },
              ]}
              onPress={() => handleStatusChange(s)}
              disabled={updating || order.orderStatus === s}
            >
              <Text style={[
                styles.statusBtnText,
                { color: order.orderStatus === s ? '#fff' : getOrderStatusColor(s) },
              ]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product?.title}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.sm,
    marginBottom: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  payMethod: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusBtn: {
    borderWidth: 1.5, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  statusBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  itemQty: { fontSize: FontSize.sm, color: Colors.textSecondary, marginHorizontal: Spacing.sm },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
});

export default AdminOrderDetailScreen;
