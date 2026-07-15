import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@models/index';
import { useAuth } from '@hooks/useAuth';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import AdminStack from './AdminStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Admin" component={AdminStack} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
