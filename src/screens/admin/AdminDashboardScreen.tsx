import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@models/index';
import { useGetDashboardQuery } from '@api/adminApi';
import LoadingScreen from '@components/common/LoadingScreen';
import ErrorView from '@components/common/ErrorView';
import StatusBadge from '@components/common/StatusBadge';
import { formatCurrency, formatDate } from '@utils/index';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AdminDashboardScreen = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch } = useGetDashboardQuery();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorView onRetry={refetch} />;

  const { stats, topProducts, latestOrders } = data?.data ?? {};

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
    >
      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon="👥" label="Total Users" value={String(stats?.totalUsers ?? 0)} color={Colors.info} />
        <StatCard icon="📦" label="Total Orders" value={String(stats?.totalOrders ?? 0)} color={Colors.warning} />
        <StatCard icon="💰" label="Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color={Colors.success} />
      </View>

      {/* Quick navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: '🏷️', label: 'Categories', route: 'AdminCategories' as const },
            { icon: '📦', label: 'Products', route: 'AdminProducts' as const },
            { icon: '🛒', label: 'Orders', route: 'AdminOrders' as const },
            { icon: '👥', label: 'Users', route: 'AdminUsers' as const },
          ].map(({ icon, label, route }) => (
            <TouchableOpacity
              key={route}
              style={styles.quickCard}
              onPress={() => navigation.navigate(route)}
            >
              <Text style={styles.quickIcon}>{icon}</Text>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Latest Orders */}
      {latestOrders && latestOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {latestOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderRow}
              onPress={() => navigation.navigate('AdminOrderDetail', { orderId: order._id })}
            >
              <View>
                <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.orderRight}>
                <StatusBadge status={order.orderStatus} />
                <Text style={styles.orderTotal}>{formatCurrency(order.totalPrice)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsGrid: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.xs },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: Colors.surface,
    margin: Spacing.sm,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: { fontSize: 32, marginBottom: Spacing.xs },
  quickLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
});

export default AdminDashboardScreen;
