import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      id: 'qr-scan',
      title: 'Quét mã QR',
      description: 'Quét mã QR trên bàn để gọi món nhanh chóng',
      icon: '📱',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('QRScan'),
    },
    {
      id: 'restaurants',
      title: 'Nhà hàng',
      description: 'Khám phá các nhà hàng ngon gần bạn',
      icon: '🏪',
      color: theme.colors.success,
      onPress: () => navigation.navigate('RestaurantList'),
    },
    {
      id: 'order-history',
      title: 'Lịch sử đơn hàng',
      description: 'Xem lại các đơn hàng đã đặt',
      icon: '📋',
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      id: 'profile',
      title: 'Hồ sơ cá nhân',
      description: 'Quản lý thông tin và cài đặt',
      icon: '👤',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const quickActions = [
    {
      id: 'demo-menu',
      title: 'Menu Demo',
      description: 'Trải nghiệm ngay',
      icon: '🍽️',
      onPress: () => navigation.navigate('Menu', { restaurantId: 'demo' }),
    },
    {
      id: 'how-to-use',
      title: 'Hướng dẫn',
      description: 'Cách sử dụng app',
      icon: '💡',
      onPress: () => {},
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Quét mã QR',
      description: 'Quét mã QR trên bàn ăn tại nhà hàng',
      icon: '📱',
      color: theme.colors.primary,
    },
    {
      number: '2',
      title: 'Chọn món',
      description: 'Duyệt menu và thêm món vào giỏ hàng',
      icon: '🍽️',
      color: theme.colors.secondary,
    },
    {
      number: '3',
      title: 'Đặt hàng',
      description: 'Xác nhận đơn hàng và theo dõi trạng thái',
      icon: '✅',
      color: theme.colors.success,
    },
    {
      number: '4',
      title: 'Thanh toán',
      description: 'Thanh toán qua QR code hoặc tiền mặt',
      icon: '💳',
      color: theme.colors.warning,
    },
  ];

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Hello, User!</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={{ opacity: fadeAnim }}
      >
        {/* Featured Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerCard}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Authenticity in every bite</Text>
                <Text style={styles.bannerSubtitle}>Experience the finest culinary traditions</Text>
              </View>
              <View style={styles.bannerImages}>
                <View style={styles.foodImage1}>
                  <Text style={styles.foodEmoji}>🍔</Text>
                  <Text style={styles.foodName}>Golden Smash...</Text>
                  <Text style={styles.foodPrice}>$16.00</Text>
                </View>
                <View style={styles.foodImage2}>
                  <Text style={styles.foodEmoji}>🥗</Text>
                  <Text style={styles.foodName}>Nordic Salmon Bowl</Text>
                  <Text style={styles.foodPrice}>$18.00</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('QRScan')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFE4E1' }]}>
                <Text style={styles.quickActionEmoji}>📱</Text>
              </View>
              <Text style={styles.quickActionTitle}>Scan to Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Menu', { restaurantId: 'demo' })}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.quickActionEmoji}>📋</Text>
              </View>
              <Text style={styles.quickActionTitle}>Browse Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('OrderHistory')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Text style={styles.quickActionEmoji}>🕒</Text>
              </View>
              <Text style={styles.quickActionTitle}>Order History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Text style={styles.quickActionEmoji}>🏷️</Text>
              </View>
              <Text style={styles.quickActionTitle}>Special Offers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          
          <View style={styles.stepsGrid}>
            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Find a Restaurant</Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: theme.colors.secondary }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Choose Your Meal</Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Fast Payment</Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: theme.colors.warning }]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Enjoy Your Food</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('OrderHistory')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <Text style={styles.navIcon}>🏷️</Text>
          <Text style={styles.navText}>Offers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating QR Button */}
      <TouchableOpacity
        style={styles.floatingQR}
        onPress={() => navigation.navigate('QRScan')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={styles.floatingQRGradient}
        >
          <Text style={styles.floatingQRIcon}>📱</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    backgroundColor: theme.colors.white,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  avatarText: {
    fontSize: 18,
  },
  
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notificationIcon: {
    fontSize: 18,
  },
  
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  bannerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  bannerText: {
    flex: 1,
    paddingRight: 16,
  },
  
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  
  bannerImages: {
    flexDirection: 'row',
    gap: 8,
  },
  
  foodImage1: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  
  foodImage2: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  
  foodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  foodName: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  
  foodPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  
  addButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  addButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  addButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  quickActionEmoji: {
    fontSize: 20,
  },
  
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  stepCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  stepNumber: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  
  activeNavIcon: {
    opacity: 1,
  },
  
  navText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  
  activeNavText: {
    color: theme.colors.primary,
  },
  
  floatingQR: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...theme.shadows.lg,
  },
  
  floatingQRGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  floatingQRIcon: {
    fontSize: 24,
  },
});

export default HomeScreen;