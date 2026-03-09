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

type OrderManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderManagement'>;

interface Props {
  navigation: OrderManagementScreenNavigationProp;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  orderTime: string;
  tableNumber?: string;
  deliveryAddress?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
}

const OrderManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'preparing' | 'ready' | 'completed'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // TODO: Implement API call to get orders
      // Mock data for now
      setOrders([
        {
          id: '1',
          customerName: 'Nguyễn Văn A',
          customerPhone: '0123456789',
          status: 'pending',
          items: [
            { id: '1', name: 'Phở bò', quantity: 2, price: 65000 },
            { id: '2', name: 'Cà phê đen', quantity: 1, price: 25000 },
          ],
          totalAmount: 155000,
          orderTime: '2024-01-15T10:30:00Z',
          tableNumber: 'B05',
          orderType: 'dine-in',
        },
        {
          id: '2',
          customerName: 'Trần Thị B',
          customerPhone: '0987654321',
          status: 'preparing',
          items: [
            { id: '3', name: 'Cơm tấm', quantity: 1, price: 45000 },
          ],
          totalAmount: 45000,
          orderTime: '2024-01-15T10:15:00Z',
          deliveryAddress: '123 Đường ABC, Quận 1',
          orderType: 'delivery',
        },
        {
          id: '3',
          customerName: 'Lê Văn C',
          customerPhone: '0369852147',
          status: 'ready',
          items: [
            { id: '4', name: 'Phở bò', quantity: 1, price: 65000 },
          ],
          totalAmount: 65000,
          orderTime: '2024-01-15T09:45:00Z',
          orderType: 'takeaway',
        },
      ]);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // TODO: Implement API call to update order status
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    navigation.navigate('OrderDetails', { order });
  };

  const getFilteredOrders = () => {
    switch (selectedTab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'preparing':
        return orders.filter(order => order.status === 'preparing');
      case 'ready':
        return orders.filter(order => order.status === 'ready');
      case 'completed':
        return orders.filter(order => order.status === 'delivered');
      default:
        return orders;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'preparing':
        return '#2196F3';
      case 'ready':
        return '#4CAF50';
      case 'delivered':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'ready':
        return 'Sẵn sàng';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getOrderTypeIcon = (orderType: Order['orderType']) => {
    switch (orderType) {
      case 'dine-in':
        return 'home';
      case 'takeaway':
        return 'shopping-bag';
      case 'delivery':
        return 'truck';
      default:
        return 'help-circle';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length },
            { key: 'preparing', label: 'Đang chuẩn bị', count: orders.filter(o => o.status === 'preparing').length },
            { key: 'ready', label: 'Sẵn sàng', count: orders.filter(o => o.status === 'ready').length },
            { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'delivered').length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.ordersContainer, { opacity: fadeAnim }]}>
          {getFilteredOrders().map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleViewOrderDetails(order)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <View style={styles.orderTypeContainer}>
                      <Icon
                        name={getOrderTypeIcon(order.orderType)}
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.orderTime}>{formatTime(order.orderTime)}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  {order.tableNumber && (
                    <Text style={styles.tableNumber}>Bàn: {order.tableNumber}</Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                {order.items.slice(0, 2).map((item) => (
                  <Text key={item.id} style={styles.itemText}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
                {order.items.length > 2 && (
                  <Text style={styles.moreItemsText}>
                    +{order.items.length - 2} món khác
                  </Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalAmount}>
                  {formatCurrency(order.totalAmount)}
                </Text>
                <View style={styles.actionButtons}>
                  {order.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, 'preparing')}
                    >
                      <Text style={styles.actionButtonText}>Nhận đơn</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'preparing' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.readyButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, 'ready')}
                    >
                      <Text style={styles.actionButtonText}>Hoàn thành</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'ready' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deliveredButton]}
                      onPress={() => handleUpdateOrderStatus(order.id, 'delivered')}
                    >
                      <Text style={styles.actionButtonText}>Đã giao</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {getFilteredOrders().length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="clipboard" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Không có đơn hàng</Text>
              <Text style={styles.emptyStateText}>
                Chưa có đơn hàng nào trong trạng thái này
              </Text>
            </View>
          )}
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
    fontWeight: '700',
    color: '#333',
  },

  placeholder: {
    width: 40,
  },

  // Tab Styles
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },

  activeTab: {
    backgroundColor: '#FF7A30',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeTabText: {
    color: '#fff',
  },

  tabBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },

  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  ordersContainer: {
    padding: 20,
  },

  // Order Card Styles
  orderCard: {
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

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  orderInfo: {
    flex: 1,
  },

  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  orderTime: {
    fontSize: 12,
    color: '#666',
  },

  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  tableNumber: {
    fontSize: 12,
    color: '#666',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  orderItems: {
    marginBottom: 12,
  },

  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },

  moreItemsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7A30',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },

  acceptButton: {
    backgroundColor: '#2196F3',
  },

  readyButton: {
    backgroundColor: '#4CAF50',
  },

  deliveredButton: {
    backgroundColor: '#9E9E9E',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderManagementScreen;