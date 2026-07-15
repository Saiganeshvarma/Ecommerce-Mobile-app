import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { Colors } from '@theme/colors';

import HomeScreen from '@screens/home/HomeScreen';
import ProductDetailScreen from '@screens/product/ProductDetailScreen';
import ProductListScreen from '@screens/product/ProductListScreen';
import SearchScreen from '@screens/home/SearchScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.textInverse,
      headerTitleStyle: { fontWeight: '600' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
    <Stack.Screen
      name="ProductList"
      component={ProductListScreen}
      options={({ route }) => ({ title: route.params?.title ?? 'Products' })}
    />
    <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default HomeStack;
