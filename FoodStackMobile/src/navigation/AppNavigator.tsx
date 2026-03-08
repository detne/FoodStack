import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import QRScanScreen from '../screens/QRScanScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import MenuScreen from '../screens/MenuScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'FoodStack',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QRScan"
          component={QRScanScreen}
          options={{
            title: 'Quét mã QR',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RestaurantList"
          component={RestaurantListScreen}
          options={{
            title: 'Nhà hàng',
          }}
        />
        <Stack.Screen
          name="RestaurantDetail"
          component={RestaurantDetailScreen}
          options={({ route }) => ({
            title: 'Chi tiết nhà hàng',
          })}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={({ route }) => ({
            title: route.params.tableInfo?.restaurant.name || 'Menu',
          })}
        />
        <Stack.Screen
          name="FoodDetail"
          component={FoodDetailScreen}
          options={({ route }) => ({
            title: route.params.menuItem.name,
          })}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Giỏ hàng',
          }}
        />
        <Stack.Screen
          name="OrderStatus"
          component={OrderStatusScreen}
          options={{
            title: 'Trạng thái đơn hàng',
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            title: 'Thanh toán',
          }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{
            title: 'Lịch sử đơn hàng',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Hồ sơ',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;