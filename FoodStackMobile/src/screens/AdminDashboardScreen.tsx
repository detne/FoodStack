import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

interface Props {
  navigation: AdminDashboardScreenNavigationProp;
}

interface AdminStats {
  totalRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  pendingApprovals: number;
  revenueGrowth: number;
  userGrowth: number;
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    pendingApprovals: 0,
    revenueGrowth: 0,
    userGrowth: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Mock data - replace with API call
      setStats({
        totalRestaurants: 45,
        totalUsers: 1250,
        totalOrders: 3420,
        totalRevenue: 125000,
        activeOrders: 28,
        pendingApprovals: 5,
        revenueGrowth: 15.5,
        userGrowth: 22.3,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => navigation.navigate('Login'),
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
      <View style={styles.header}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Admin Panel</Text>
              <Text style={styles.adminName}>System Administrator</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Icon name="home" size={24} color="#6366F1" />
              <Text style={styles.statNumber}>{stats.totalRestaurants}</Text>
              <Text style={styles.statLabel}>Nhà hàng</Text>
            </View>

            <View style={[styles.statCard, styles.statCardBlue]}>
              <Icon name="user" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
              <Text style={styles.statGrowth}>+{stats.userGrowth}%</Text>
            </View>

            <View style={[styles.statCard, styles.statCardGreen]}>
              <Icon name="orders" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>

            <View style={[styles.statCard, styles.statCardOrange]}>
              <Icon name="dollar-sign" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Doanh thu</Text>
              <Text style={styles.statGrowth}>+{stats.revenueGrowth}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminRestaurants')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.actionGradient}
              >
                <Icon name="home" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Nhà hàng</Text>
                <Text style={styles.actionSubtitle}>Quản lý nhà hàng</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminUsers')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionGradient}
              >
                <Icon name="user" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Người dùng</Text>
                <Text style={styles.actionSubtitle}>Quản lý users</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminOrders')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <Icon name="orders" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Đơn hàng</Text>
                <Text style={styles.actionSubtitle}>Theo dõi orders</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminReports')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Icon name="chart" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Báo cáo</Text>
                <Text style={styles.actionSubtitle}>Thống kê chi tiết</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminApprovals')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.actionGradient}
              >
                <Icon name="check" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Phê duyệt</Text>
                <Text style={styles.actionSubtitle}>{stats.pendingApprovals} chờ duyệt</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSettings')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionGradient}
              >
                <Icon name="settings" size={28} color="#fff" />
                <Text style={styles.actionTitle}>Cài đặt</Text>
                <Text style={styles.actionSubtitle}>Cấu hình hệ thống</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Orders Alert */}
        {stats.activeOrders > 0 && (
          <View style={styles.alertBox}>
            <Icon name="bell" size={20} color="#F59E0B" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Đơn hàng đang xử lý</Text>
              <Text style={styles.alertText}>
                Có {stats.activeOrders} đơn hàng đang được xử lý
              </Text>
            </View>
          </View>
        )}

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
          <TouchableOpacity
            style={styles.alertBox}
            onPress={() => navigation.navigate('AdminApprovals')}
            activeOpacity={0.7}
          >
            <Icon name="info" size={20} color="#EF4444" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Cần phê duyệt</Text>
              <Text style={styles.alertText}>
                {stats.pendingApprovals} nhà hàng chờ phê duyệt
              </Text>
            </View>
            <Icon name="arrow-right" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

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
    fontWeight: '600',
  },

  adminName: {
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },

  statCardPurple: {
    borderLeftColor: '#6366F1',
  },

  statCardBlue: {
    borderLeftColor: '#3B82F6',
  },

  statCardGreen: {
    borderLeftColor: '#10B981',
  },

  statCardOrange: {
    borderLeftColor: '#F59E0B',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  statGrowth: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
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
    ...theme.shadows.md,
  },

  actionGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },

  actionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },

  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    ...theme.shadows.sm,
  },

  alertContent: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
  },

  alertText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
