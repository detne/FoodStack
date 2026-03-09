import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminRestaurantsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminRestaurants'>;

interface Props {
  navigation: AdminRestaurantsScreenNavigationProp;
}

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  orders: number;
  revenue: number;
}

const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Nhà hàng ABC', owner: 'Nguyễn Văn A', status: 'active', orders: 245, revenue: 45000000 },
  { id: '2', name: 'Quán Phở Hà Nội', owner: 'Trần Thị B', status: 'active', orders: 189, revenue: 32000000 },
  { id: '3', name: 'Cơm Tấm Sài Gòn', owner: 'Lê Văn C', status: 'pending', orders: 0, revenue: 0 },
  { id: '4', name: 'Bún Bò Huế', owner: 'Phạm Thị D', status: 'active', orders: 156, revenue: 28000000 },
  { id: '5', name: 'Bánh Mì 362', owner: 'Hoàng Văn E', status: 'suspended', orders: 98, revenue: 15000000 },
];

const AdminRestaurantsScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  const filteredRestaurants = MOCK_RESTAURANTS.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
                         restaurant.owner.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || restaurant.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRestaurantAction = (restaurant: Restaurant, action: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} nhà hàng "${restaurant.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => console.log(`${action} ${restaurant.id}`) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'suspended': return '#EF4444';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'suspended': return 'Tạm ngưng';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý nhà hàng</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhà hàng..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Chờ duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'suspended' && styles.filterChipActive]}
          onPress={() => setFilter('suspended')}
        >
          <Text style={[styles.filterText, filter === 'suspended' && styles.filterTextActive]}>
            Tạm ngưng
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Restaurant List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredRestaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantOwner}>Chủ: {restaurant.owner}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(restaurant.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(restaurant.status) }]}>
                  {getStatusText(restaurant.status)}
                </Text>
              </View>
            </View>

            <View style={styles.restaurantStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{restaurant.orders}</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(restaurant.revenue / 1000000).toFixed(1)}M
                </Text>
                <Text style={styles.statLabel}>Doanh thu</Text>
              </View>
            </View>

            <View style={styles.restaurantActions}>
              {restaurant.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleRestaurantAction(restaurant, 'phê duyệt')}
                >
                  <Text style={styles.actionButtonText}>Phê duyệt</Text>
                </TouchableOpacity>
              )}
              {restaurant.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.suspendButton]}
                  onPress={() => handleRestaurantAction(restaurant, 'tạm ngưng')}
                >
                  <Text style={styles.actionButtonText}>Tạm ngưng</Text>
                </TouchableOpacity>
              )}
              {restaurant.status === 'suspended' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.activateButton]}
                  onPress={() => handleRestaurantAction(restaurant, 'kích hoạt')}
                >
                  <Text style={styles.actionButtonText}>Kích hoạt</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => console.log('View details', restaurant.id)}
              >
                <Text style={styles.viewButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    ...theme.shadows.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  filterContainer: {
    marginBottom: 16,
  },

  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },

  filterTextActive: {
    color: '#fff',
  },

  list: {
    flex: 1,
  },

  listContent: {
    padding: 20,
    gap: 12,
  },

  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },

  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  restaurantOwner: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  restaurantActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  approveButton: {
    backgroundColor: '#10B981',
  },

  suspendButton: {
    backgroundColor: '#EF4444',
  },

  activateButton: {
    backgroundColor: '#10B981',
  },

  viewButton: {
    backgroundColor: '#f5f5f0',
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },

  viewButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
  },
});

export default AdminRestaurantsScreen;
