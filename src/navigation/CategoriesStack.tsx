import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@models/index';
import { Colors } from '@theme/colors';

import CategoriesScreen from '@screens/home/CategoriesScreen';
import ProductListScreen from '@screens/product/ProductListScreen';
import ProductDetailScreen from '@screens/product/ProductDetailScreen';
import SearchScreen from '@screens/home/SearchScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const CategoriesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.textInverse,
      headerTitleStyle: { fontWeight: '600' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Home" component={CategoriesScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="ProductList"
      component={ProductListScreen}
      options={({ route }) => ({ title: route.params?.title ?? 'Products' })}
    />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Products' }} />
  </Stack.Navigator>
);

export default CategoriesStack;
