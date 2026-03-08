import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type OrderHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderHistory'>;

interface Props {
  navigation: OrderHistoryScreenNavigationProp;
}

interface HistoryOrder {
  id: string;
  restaurant_name: string;
  branch_name: string;
  table_name: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
  total_amount: number;
  created_at: string;
  items_count: number;
  items_preview: string[];
}

const OrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data - trong thực tế sẽ fetch từ API
  const orders: HistoryOrder[] = [
    {
      id: 'order-1',
      restaurant_name: 'Nhà hàng Sài Gòn',
      branch_name: 'Chi nhánh Quận 1',
      table_name: 'T01',
      status: 'Paid',
      total_amount: 250000,
      created_at: '2024-03-08T10:30:00Z',
      items_count: 3,
      items_preview: ['Phở bò', 'Gỏi cuốn', 'Trà đá'],
    },
    {
      id: 'order-2',
      restaurant_name: 'Pizza House',
      branch_name: 'Chi nhánh Thủ Đức',
      table_name: 'T05',
      status: 'Served',
      total_amount: 180000,
      created_at: '2024-03-07T19:15:00Z',
      items_count: 2,
      items_preview: ['Pizza Margherita', 'Coca Cola'],
    },
    {
      id: 'order-3',
      restaurant_name: 'Sushi Tokyo',
      branch_name: 'Chi nhánh Quận 3',
      table_name: 'T12',
      status: 'Cancelled',
      total_amount: 320000,
      created_at: '2024-03-06T12:45:00Z',
      items_count: 4,
      items_preview: ['Sushi set', 'Miso soup', 'Sake', 'Tempura'],
    },
    {
      id: 'order-4',
      restaurant_name: 'FoodStack Demo',
      branch_name: 'Demo Branch',
      table_name: 'T01',
      status: 'Preparing',
      total_amount: 150000,
      created_at: '2024-03-08T14:20:00Z',
      items_count: 2,
      items_preview: ['Demo Burger', 'Demo Fries'],
    },
  ];

  const filters = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'paid', label: 'Đã thanh toán', count: orders.filter(o => o.status === 'Paid').length },
    { id: 'active', label: 'Đang xử lý', count: orders.filter(o => ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)).length },
    { id: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  const filteredOrders = orders.filter(order => {
    switch (selectedFilter) {
      case 'paid':
        return order.status === 'Paid';
      case 'active':
        return ['Pending', 'Preparing', 'Ready', 'Served'].includes(order.status);
      case 'cancelled':
        return order.status === 'Cancelled';
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Preparing': return '#3b82f6';
      case 'Ready': return '#10b981';
      case 'Served': return '#059669';
      case 'Paid': return '#6b7280';
      case 'Cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Preparing': return 'Đang chuẩn bị';
      case 'Ready': return 'Sẵn sàng';
      case 'Served': return 'Đã phục vụ';
      case 'Paid': return 'Đã thanh toán';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderOrder = ({ item }: { item: HistoryOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        if (['Pending', 'Preparing', 'Ready', 'Served'].includes(item.status)) {
          navigation.navigate('OrderStatus', {
            orderId: item.id,
            sessionToken: 'demo-session',
            tableInfo: {
              table: { id: 'table-1', name: item.table_name, capacity: 4, status: 'Occupied' },
              branch: { id: 'branch-1', name: item.branch_name, restaurant_id: 'restaurant-1', restaurant: { id: 'restaurant-1', name: item.restaurant_name } },
              restaurant: { id: 'restaurant-1', name: item.restaurant_name }
            }
          });
        }
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
          <Text style={styles.branchInfo}>{item.branch_name} • Bàn {item.table_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemsPreview}>
          {item.items_preview.join(', ')}
          {item.items_count > item.items_preview.length && ` và ${item.items_count - item.items_preview.length} món khác`}
        </Text>
        <Text style={styles.itemsCount}>{item.items_count} món</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.orderTotal}>{formatPrice(item.total_amount)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilter = ({ item }: { item: typeof filters[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item.id && styles.selectedFilterChip,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.selectedFilterText,
        ]}
      >
        {item.label} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <Text style={styles.headerSubtitle}>Xem các đơn hàng đã đặt</Text>
      </View>

      {/* Filters */}
      <FlatList
        data={filters}
        renderItem={renderFilter}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersList}
        contentContainerStyle={styles.filtersContent}
      />

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptyDescription}>
            {selectedFilter === 'all' 
              ? 'Bạn chưa có đơn hàng nào. Hãy quét QR code để bắt đầu gọi món!'
              : `Không có đơn hàng nào trong danh mục "${filters.find(f => f.id === selectedFilter)?.label}"`
            }
          </Text>
          <TouchableOpacity
            style={styles.startOrderButton}
            onPress={() => navigation.navigate('QRScan')}
          >
            <Text style={styles.startOrderButtonText}>Bắt đầu gọi món</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filtersList: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedFilterChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedFilterText: {
    color: '#fff',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  branchInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  itemsPreview: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  itemsCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startOrderButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;