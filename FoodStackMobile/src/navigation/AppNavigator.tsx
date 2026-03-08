import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Splash Screen
import SplashScreen from '../screens/SplashScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';

// Main Screens
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
import OffersScreen from '../screens/OffersScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
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
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Đăng nhập',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UserTypeSelection"
          component={UserTypeSelectionScreen}
          options={{
            title: 'Chọn loại tài khoản',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Đăng ký',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: 'Quên mật khẩu',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
          options={{
            title: 'Xác thực email',
            headerShown: false,
          }}
        />

        {/* Main App Screens */}
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
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Hồ sơ',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Offers"
          component={OffersScreen}
          options={{
            title: 'Special Offers',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;