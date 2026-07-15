import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

import { store, persistor } from '@redux/store';
import RootNavigator from '@navigation/RootNavigator';
import LoadingScreen from '@components/common/LoadingScreen';
import { StyleSheet } from 'react-native';

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'ecommerceapp://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset-password/:token',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              ProductDetail: 'product/:productId',
            },
          },
        },
      },
    },
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen message="Starting up..." />} persistor={persistor}>
        <GestureHandlerRootView style={styles.flex}>
          <NavigationContainer linking={linking}>
            <StatusBar style="auto" />
            <RootNavigator />
            <Toast />
          </NavigationContainer>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
