import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@models/index';
import { Colors } from '@theme/colors';
import { useAuth } from '@hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import AdminDashboardScreen from '@screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '@screens/admin/AdminUsersScreen';
import AdminUserDetailScreen from '@screens/admin/AdminUserDetailScreen';
import AdminCategoriesScreen from '@screens/admin/AdminCategoriesScreen';
import AdminAddCategoryScreen from '@screens/admin/AdminAddCategoryScreen';
import AdminEditCategoryScreen from '@screens/admin/AdminEditCategoryScreen';
import AdminProductsScreen from '@screens/admin/AdminProductsScreen';
import AdminAddProductScreen from '@screens/admin/AdminAddProductScreen';
import AdminEditProductScreen from '@screens/admin/AdminEditProductScreen';
import AdminOrdersScreen from '@screens/admin/AdminOrdersScreen';
import AdminOrderDetailScreen from '@screens/admin/AdminOrderDetailScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminStack = () => {
  const { isAdmin } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.secondary },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} options={{ title: 'User Detail' }} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: 'Categories' }} />
      <Stack.Screen name="AdminAddCategory" component={AdminAddCategoryScreen} options={{ title: 'Add Category' }} />
      <Stack.Screen name="AdminEditCategory" component={AdminEditCategoryScreen} options={{ title: 'Edit Category' }} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="AdminAddProduct" component={AdminAddProductScreen} options={{ title: 'Add Product' }} />
      <Stack.Screen name="AdminEditProduct" component={AdminEditProductScreen} options={{ title: 'Edit Product' }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ title: 'Order Detail' }} />
    </Stack.Navigator>
  );
};

export default AdminStack;
