import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CartStackParamList } from '@models/index';
import { Colors } from '@theme/colors';

import CartScreen from '@screens/cart/CartScreen';
import CheckoutScreen from '@screens/checkout/CheckoutScreen';
import OrderSuccessScreen from '@screens/checkout/OrderSuccessScreen';

const Stack = createNativeStackNavigator<CartStackParamList>();

const CartStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.textInverse,
      headerTitleStyle: { fontWeight: '600' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default CartStack;
