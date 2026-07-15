import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@models/index';
import { Colors } from '@theme/colors';

import ProfileScreen from '@screens/profile/ProfileScreen';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import ChangePasswordScreen from '@screens/profile/ChangePasswordScreen';
import OrderHistoryScreen from '@screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '@screens/orders/OrderDetailScreen';
import AddressListScreen from '@screens/address/AddressListScreen';
import AddAddressScreen from '@screens/address/AddAddressScreen';
import EditAddressScreen from '@screens/address/EditAddressScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.textInverse,
      headerTitleStyle: { fontWeight: '600' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'My Addresses' }} />
    <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add Address' }} />
    <Stack.Screen name="EditAddress" component={EditAddressScreen} options={{ title: 'Edit Address' }} />
  </Stack.Navigator>
);

export default ProfileStack;
