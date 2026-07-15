import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CartStackParamList } from '@models/index';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@theme/colors';
import { FontSize, FontWeight } from '@theme/typography';
import { BorderRadius, Spacing } from '@theme/spacing';
import AppButton from '@components/common/AppButton';

type Route = RouteProp<CartStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withDelay(200, withSpring(1));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, iconStyle]}>
        <Text style={styles.icon}>✅</Text>
      </Animated.View>
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.message}>
          Your order has been placed successfully. We'll notify you once it's confirmed.
        </Text>
        <View style={styles.orderIdBox}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId}>{orderId.slice(-12).toUpperCase()}</Text>
        </View>
        <AppButton
          title="View Order Details"
          onPress={() => {
            // CartStack's parent is MainTabs — navigate to ProfileTab
            const mainTabs = navigation.getParent();
            if (mainTabs) {
              (mainTabs as any).navigate('ProfileTab', {
                screen: 'OrderDetail',
                params: { orderId },
              });
            }
          }}
          variant="outline"
          size="lg"
          style={styles.btn}
        />
        <AppButton
          title="Continue Shopping"
          onPress={goHome}
          size="lg"
          style={styles.btn}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: { fontSize: 60 },
  content: { width: '100%', alignItems: 'center' },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  orderIdBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderIdLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  orderId: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1 },
  btn: { marginBottom: Spacing.sm },
});

export default OrderSuccessScreen;
