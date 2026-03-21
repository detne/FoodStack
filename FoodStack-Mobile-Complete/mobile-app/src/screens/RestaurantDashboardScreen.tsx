import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { getApiBaseUrl } from '../services/api-config';
import { storage, restaurantApi, branchApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type RestaurantDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantDashboard'>;

interface Props {
  navigation: RestaurantDashboardScreenNavigationProp;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalMenuItems: number;
  activeTables: number;
  avgServiceTime: string;
  revenueChange: number;
  ordersChange: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'service';
  title: string;
  time: string;
  amount?: string;
}

interface TopItem {
  name: string;
  sold: number;
  progress: number;
}

const RestaurantDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalMenuItems: 0,
    activeTables: 0,
    avgServiceTime: '0m',
    revenueChange: 0,
    ordersChange: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Nhà hàng');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading restaurant dashboard data...');
      
      // Fetch real data from backend APIs using the API service
      const [restaurantsRes, statisticsRes, branchesRes] = await Promise.allSettled([
        restaurantApi.getMyRestaurants(),
        restaurantApi.getMyStatistics(),
        branchApi.getBranches(),
      ]);

      let todayOrders = 0;
      let todayRevenue = 0;
      let pendingOrders = 0;
      let totalMenuItems = 0;
      let activeTables = 0;
      let avgServiceTime = '0m';
      let revenueChange = 0;
      let ordersChange = 0;

      // Process restaurants data to get restaurant name
      if (restaurantsRes.status === 'fulfilled' && restaurantsRes.value.success) {
        if (restaurantsRes.value.data && restaurantsRes.value.data.length > 0) {
          setRestaurantName(restaurantsRes.value.data[0].name);
          console.log('✅ Restaurant info loaded:', restaurantsRes.value.data[0].name);
        }
      }

      // Process statistics data
      if (statisticsRes.status === 'fulfilled' && statisticsRes.value.success) {
        const stats = statisticsRes.value.data;
        todayOrders = stats.todayOrders || 0;
        todayRevenue = stats.todayRevenue || 0;
        pendingOrders = stats.pendingOrders || 0;
        totalMenuItems = stats.totalMenuItems || 0;
        activeTables = stats.activeTables || 0;
        avgServiceTime = stats.avgServiceTime || '0m';
        revenueChange = stats.revenueChange || 0;
        ordersChange = stats.ordersChange || 0;
        console.log('✅ Restaurant statistics loaded:', stats);
      } else {
        console.log('⚠️ Statistics API not available, using mock data');
        // Use demo data for testing
        todayOrders = 12;
        todayRevenue = 450000;
        pendingOrders = 3;
        totalMenuItems = 25;
        activeTables = 8;
        avgServiceTime = '14m 20s';
        revenueChange = 12.5;
        ordersChange = 8.2;
      }

      setStats({
        todayOrders,
        todayRevenue,
        pendingOrders,
        totalMenuItems,
        activeTables,
        avgServiceTime,
        revenueChange,
        ordersChange,
      });

      // Set recent activity (mock data for now)
      setRecentActivity([
        { id: '1', type: 'order', title: 'Đơn hàng mới #402', time: '2 phút trước', amount: '125.000đ' },
        { id: '2', type: 'service', title: 'Yêu cầu phục vụ bàn 4', time: '5 phút trước' },
        { id: '3', type: 'payment', title: 'Thanh toán #398', time: '12 phút trước', amount: '89.000đ' },
      ]);

      // Set top items (mock data for now)
      setTopItems([
        { name: 'Phở bò đặc biệt', sold: 342, progress: 85 },
        { name: 'Cơm tấm sườn nướng', sold: 289, progress: 72 },
        { name: 'Cà phê sữa đá', sold: 215, progress: 54 },
      ]);

      console.log('📊 Restaurant dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading restaurant dashboard data:', error);
      
      // Fallback to demo data
      setStats({
        todayOrders: 12,
        todayRevenue: 450000,
        pendingOrders: 3,
        totalMenuItems: 25,
        activeTables: 8,
        avgServiceTime: '14m 20s',
        revenueChange: 12.5,
        ordersChange: 8.2,
      });

      setRecentActivity([
        { id: '1', type: 'order', title: 'Đơn hàng mới #402', time: '2 phút trước', amount: '125.000đ' },
        { id: '2', type: 'service', title: 'Yêu cầu phục vụ bàn 4', time: '5 phút trước' },
        { id: '3', type: 'payment', title: 'Thanh toán #398', time: '12 phút trước', amount: '89.000đ' },
      ]);

      setTopItems([
        { name: 'Phở bò đặc biệt', sold: 342, progress: 85 },
        { name: 'Cơm tấm sườn nướng', sold: 289, progress: 72 },
        { name: 'Cà phê sữa đá', sold: 215, progress: 54 },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleMenuManagement = () => {
    navigation.navigate('MenuManagement');
  };

  const handleOrderManagement = () => {
    navigation.navigate('OrderManagement');
  };

  const handleRestaurantSettings = () => {
    navigation.navigate('RestaurantSettings');
  };

  const handleStatistics = () => {
    navigation.navigate('RestaurantStatistics');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.replace('Login');
            }
          }
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Icon name="shopping-bag" size={24} color="#FF7A30" />
              <Text style={styles.statNumber}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Đơn hôm nay</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Icon name="dollar-sign" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{formatCurrency(stats.todayRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu hôm nay</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Icon name="clock" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Đơn chờ xử lý</Text>
            </View>
            <View style={[styles.statCard, styles.statCardInfo]}>
              <Icon name="menu" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.totalMenuItems}</Text>
              <Text style={styles.statLabel}>Món ăn</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.activityContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={[
                styles.activityIcon,
                activity.type === 'order' ? styles.orderIcon :
                activity.type === 'payment' ? styles.paymentIcon : styles.serviceIcon
              ]}>
                <Icon 
                  name={activity.type === 'order' ? 'shopping-bag' : 
                        activity.type === 'payment' ? 'dollar-sign' : 'bell'} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              {activity.amount && (
                <Text style={styles.activityAmount}>{activity.amount}</Text>
              )}
            </View>
          ))}
        </Animated.View>

        {/* Top Items */}
        <Animated.View
          style={[
            styles.topItemsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
          {topItems.map((item, index) => (
            <View key={index} style={styles.topItemCard}>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemSold}>{item.sold} đã bán</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[styles.progressBar, { width: `${item.progress}%` }]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleOrderManagement}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF7A30', '#E8622A']}
                style={styles.actionGradient}
              >
                <Icon name="orders" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý đơn hàng</Text>
                <Text style={styles.actionSubtitle}>Xem và xử lý đơn hàng</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleMenuManagement}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.actionGradient}
              >
                <Icon name="menu" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Quản lý menu</Text>
                <Text style={styles.actionSubtitle}>Thêm, sửa món ăn</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleStatistics}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionGradient}
              >
                <Icon name="chart" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Thống kê</Text>
                <Text style={styles.actionSubtitle}>Báo cáo doanh thu</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleRestaurantSettings}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.actionGradient}
              >
                <Icon name="settings" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Cài đặt</Text>
                <Text style={styles.actionSubtitle}>Thông tin nhà hàng</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  // Header Styles
  header: {
    marginBottom: 20,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },

  restaurantName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Stats Styles
  statsContainer: {
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
  },

  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Styles
  actionsContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },

  actionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Activity Styles
  activityContainer: {
    marginBottom: 24,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  orderIcon: {
    backgroundColor: '#4CAF50',
  },

  paymentIcon: {
    backgroundColor: '#2196F3',
  },

  serviceIcon: {
    backgroundColor: '#FF9800',
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  activityTime: {
    fontSize: 12,
    color: '#666',
  },

  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A30',
  },

  // Top Items Styles
  topItemsContainer: {
    marginBottom: 24,
  },

  topItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  topItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  topItemSold: {
    fontSize: 12,
    color: '#666',
  },

  progressBarContainer: {
    width: '100%',
  },

  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#FF7A30',
    borderRadius: 3,
  },
});

export default RestaurantDashboardScreen;