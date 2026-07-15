import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList, OrderStatus } from '@models/index';
import { useGetAdminOrdersQuery } from '@api/adminApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import StatusBadge from '@components/common/StatusBadge';
import { formatCurrency, formatDate } from '@utils/index';
import { ORDER_STATUSES } from '@constants/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import type { Order } from '@models/index';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const AdminOrdersScreen = () => {
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const orders = data?.data?.orders ?? [];

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item._id })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>#{item._id.slice(-8).toUpperCase()}</Text>
        <StatusBadge status={item.orderStatus} />
      </View>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      <View style={styles.cardBottom}>
        <StatusBadge status={item.paymentStatus} type="payment" />
        <Text style={styles.total}>{formatCurrency(item.totalPrice)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TouchableOpacity
          style={[styles.chip, !statusFilter && styles.chipActive]}
          onPress={() => setStatusFilter(undefined)}
        >
          <Text style={[styles.chipText, !statusFilter && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {ORDER_STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {orders.length === 0 ? (
        <EmptyView icon="cart-outline" title="No orders found" />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filters: { backgroundColor: Colors.surface, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
    marginRight: Spacing.sm, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text },
  chipTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  list: { padding: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  date: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
});

export default AdminOrdersScreen;
