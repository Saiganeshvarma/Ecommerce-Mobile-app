import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@models/index';
import { useGetOrdersQuery } from '@api/orderApi';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ErrorView from '@components/common/ErrorView';
import StatusBadge from '@components/common/StatusBadge';
import { formatCurrency, formatDate } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import type { Order } from '@models/index';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const OrderHistoryScreen = () => {
  const navigation = useNavigation<Nav>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetOrdersQuery({ page, limit: 10 });

  const orders = data?.data?.orders ?? [];
  const pagination = data?.data?.pagination;

  const handleLoadMore = useCallback(() => {
    if (!isFetching && pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [isFetching, pagination]);

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item._id.slice(-8).toUpperCase()}</Text>
        <StatusBadge status={item.orderStatus} />
      </View>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</Text>
        <Text style={styles.total}>{formatCurrency(item.totalPrice)}</Text>
      </View>
      <View style={styles.payRow}>
        <StatusBadge status={item.paymentStatus} type="payment" />
        <Text style={styles.payMethod}>{item.paymentMethod.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <EmptyView
          icon="cube-outline"
          title="No orders yet"
          message="Your order history will appear here"
          actionLabel="Start Shopping"
          onAction={() => navigation.getParent()?.navigate('HomeTab' as never)}
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => { setPage(1); refetch(); }} colors={[Colors.primary]} />}
          ListFooterComponent={
            isFetching ? <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} /> : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  date: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  itemCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  total: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  payMethod: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
});

export default OrderHistoryScreen;
