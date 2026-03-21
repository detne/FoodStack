import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, TableInfo, Order } from '../types';
import { orderApi } from '../services/api';
import { theme } from '../theme';
import Icon from '../components/Icon';

type OrderStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderStatus'>;

interface Props {
  navigation: OrderStatusScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      sessionToken?: string;
      tableInfo?: TableInfo;
    };
  };
}

const OrderStatusScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, sessionToken, tableInfo } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order status
  const { data: orderData, isLoading, error, refetch } = useQuery({
    queryKey: ['orderStatus', orderId],
    queryFn: () => orderApi.getOrderStatus(orderId, sessionToken!),
    enabled: !!sessionToken,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // 10 seconds
  });

  const order = orderData?.order;

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          icon: '⏳',
          title: 'Đang chờ xác nhận',
          description: 'Đơn hàng của bạn đang được xem xét',
          color: '#FF9500',
          progress: 25,
        };
      case 'Preparing':
        return {
          icon: '👨‍🍳',
          title: 'Đang chuẩn bị',
          description: 'Bếp đang chuẩn bị món ăn của bạn',
          color: '#007AFF',
          progress: 50,
        };
      case 'Ready':
        return {
          icon: '🔔',
          title: 'Sẵn sàng phục vụ',
          description: 'Món ăn đã sẵn sàng, nhân viên sẽ mang đến bàn',
          color: '#34C759',
          progress: 75,
        };
      case 'Served':
        return {
          icon: '✅',
          title: 'Đã phục vụ',
          description: 'Món ăn đã được mang đến bàn của bạn',
          color: '#34C759',
          progress: 100,
        };
      case 'Paid':
        return {
          icon: '💳',
          title: 'Đã thanh toán',
          description: 'Đơn hàng đã được thanh toán thành công',
          color: '#34C759',
          progress: 100,
        };
      case 'Cancelled':
        return {
          icon: '❌',
          title: 'Đã hủy',
          description: 'Đơn hàng đã được hủy',
          color: '#FF3B30',
          progress: 0,
        };
      default:
        return {
          icon: '❓',
          title: 'Không xác định',
          description: 'Trạng thái đơn hàng không xác định',
          color: '#8E8E93',
          progress: 0,
        };
    }
  };

  const getPaymentStatusInfo = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Pending':
        return { icon: '⏳', title: 'Chờ thanh toán', color: '#FF9500' };
      case 'Success':
        return { icon: '✅', title: 'Đã thanh toán', color: '#34C759' };
      case 'Failed':
        return { icon: '❌', title: 'Thanh toán thất bại', color: '#FF3B30' };
      case 'Refunded':
        return { icon: '↩️', title: 'Đã hoàn tiền', color: '#007AFF' };
      default:
        return { icon: '❓', title: 'Không xác định', color: '#8E8E93' };
    }
  };

  if (!sessionToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Lỗi</Text>
          <Text style={styles.errorMessage}>Không tìm thấy session token</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8622A" />
          <Text style={styles.loadingText}>Đang tải trạng thái đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Không thể tải đơn hàng</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.payment_status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Trạng thái đơn hàng</Text>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Icon name="refresh" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Order Info */}
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
          <Text style={styles.orderTime}>
            {new Date(order.created_at).toLocaleString('vi-VN')}
          </Text>
          {tableInfo && (
            <Text style={styles.tableInfo}>
              Bàn {tableInfo.table.name} - {tableInfo.restaurant.name}
            </Text>
          )}
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                {statusInfo.title}
              </Text>
              <Text style={styles.statusDescription}>
                {statusInfo.description}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${statusInfo.progress}%`, backgroundColor: statusInfo.color }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{statusInfo.progress}%</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentIcon}>{paymentInfo.icon}</Text>
            <Text style={[styles.paymentTitle, { color: paymentInfo.color }]}>
              {paymentInfo.title}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              
              {item.customizations && item.customizations.length > 0 && (
                <View style={styles.customizationsContainer}>
                  {item.customizations.map((customization, custIndex) => (
                    <Text key={custIndex} style={styles.customizationText}>
                      • {customization.name}
                      {customization.price_delta !== 0 && (
                        <Text style={styles.customizationPrice}>
                          {' '}({customization.price_delta > 0 ? '+' : ''}
                          {customization.price_delta.toLocaleString('vi-VN')}đ)
                        </Text>
                      )}
                    </Text>
                  ))}
                </View>
              )}

              {item.notes && (
                <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
              )}

              <Text style={styles.itemPrice}>
                {(item.base_price * item.quantity + 
                  (item.customizations?.reduce((sum, c) => sum + c.price_delta, 0) || 0) * item.quantity
                ).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Tổng kết</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {order.sub_total.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
            <Text style={styles.summaryValue}>
              {(order.total_amount - order.sub_total).toLocaleString('vi-VN')}đ
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {order.total_amount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {order.status === 'Served' && order.payment_status === 'Pending' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => navigation.navigate('Payment', {
              orderId: order.id,
              sessionToken,
              tableInfo,
            })}
          >
            <LinearGradient
              colors={['#FF7A30', '#E8622A']}
              style={styles.paymentGradient}
            >
              <Text style={styles.paymentButtonText}>Thanh toán</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Order Info
  orderInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  tableInfo: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '500',
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    ...theme.shadows.sm,
  },
  
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  
  statusTextContainer: {
    flex: 1,
  },
  
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 32,
  },
  
  // Payment Card
  paymentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  paymentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Items
  itemsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  customizationsContainer: {
    marginBottom: 8,
  },
  
  customizationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  
  customizationPrice: {
    color: '#E8622A',
  },
  
  itemNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
    textAlign: 'right',
  },
  
  // Summary
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  // Notes
  notesContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  
  retryButton: {
    backgroundColor: '#E8622A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Bottom Actions
  bottomActions: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  paymentGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderStatusScreen;