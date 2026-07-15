import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '@models/index';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '@api/cartApi';
import { setCartItemCount } from '@redux/slices/cartSlice';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { useToast } from '@hooks/useToast';
import { extractErrorMessage, formatCurrency } from '@utils/index';
import AppButton from '@components/common/AppButton';
import LoadingScreen from '@components/common/LoadingScreen';
import EmptyView from '@components/common/EmptyView';
import ConfirmModal from '@components/common/ConfirmModal';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { CartItem } from '@models/index';

type Nav = NativeStackNavigationProp<CartStackParamList>;

const CartScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useToast();
  const [clearModalVisible, setClearModalVisible] = useState(false);

  const { data, isLoading, refetch } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();

  const cart = data?.data?.cart;
  // Backend returns 'products', transformResponse normalizes to 'items'; safe fallback for both
  const items: CartItem[] = (cart as any)?.items ?? (cart as any)?.products ?? [];

  const syncCount = (count: number) => dispatch(setCartItemCount(count));

  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await updateItem({ productId, quantity: newQty }).unwrap();
      const c = res.data.cart as any;
      syncCount((c.items ?? c.products ?? []).length);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const res = await removeItem(productId).unwrap();
      const c = res.data.cart as any;
      syncCount((c.items ?? c.products ?? []).length);
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      syncCount(0);
      setClearModalVisible(false);
      showSuccess('Cart cleared');
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const product = item.product as any;
    if (!product || typeof product !== 'object') return sum;
    const price =
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price ?? 0;
    return sum + price * (item.quantity ?? 1);
  }, 0) || ((cart as any)?.totalPrice ?? 0);

  const renderItem = ({ item }: { item: CartItem }) => {
    const product = item.product as any;
    const isPopulated = product && typeof product === 'object' && product.title;
    const price = isPopulated
      ? (product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price ?? 0)
      : 0;
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: isPopulated ? product.images?.[0]?.url : undefined }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>{isPopulated ? product.title : '—'}</Text>
          <Text style={styles.brand}>{isPopulated ? product.brand : ''}</Text>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => isPopulated && handleQuantityChange(product._id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => isPopulated && handleQuantityChange(product._id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => isPopulated && handleRemove(product._id)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.itemTotal}>{formatCurrency(price * item.quantity)}</Text>
      </View>
    );
  };

  if (isLoading) return <LoadingScreen />;

  if (items.length === 0) {
    return (
      <EmptyView
        icon="cart-outline"
        title="Your cart is empty"
        message="Add items to get started"
        actionLabel="Shop Now"
        onAction={() => navigation.getParent()?.navigate('HomeTab' as never)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => {
          const product = item.product as any;
          return typeof product === 'object' ? product._id : String(product);
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.itemCount}>{items.length} items</Text>
            <TouchableOpacity onPress={() => setClearModalVisible(true)}>
              <Text style={styles.clearBtn}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Price Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>FREE</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <AppButton
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </View>

      <ConfirmModal
        visible={clearModalVisible}
        title="Clear Cart"
        message="Remove all items from your cart?"
        confirmLabel="Clear"
        onConfirm={handleClearCart}
        onCancel={() => setClearModalVisible(false)}
        loading={clearing}
        destructive
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.sm, paddingBottom: 0 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  itemCount: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  clearBtn: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.medium },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  image: { width: 96, height: 96 },
  details: { flex: 1, padding: Spacing.sm },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, lineHeight: 18 },
  brand: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.xs },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 24, textAlign: 'center' },
  removeBtn: { marginLeft: Spacing.sm },
  itemTotal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    padding: Spacing.sm,
    alignSelf: 'flex-start',
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
});

export default CartScreen;
