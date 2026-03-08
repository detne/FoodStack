import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Order } from '../types';
import { orderApi } from '../services/api';

type OrderStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderStatus'>;
type OrderStatusScreenRouteProp = RouteProp<RootStackParamList, 'OrderStatus'>;

interface Props {
  navigation: OrderStatusScreenNavigationProp;
  route: OrderStatusScreenRouteProp;
}

const OrderStatusScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, sessionToken, tableInfo } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrderStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrderStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await orderApi.getOrderStatus(orderId, sessionToken);
      setOrder(result.order);
    } catch (error) {
      console.error('Load order status error:', error);
      Alert.alert('Error', 'Failed to load order status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending': return 'Your order has been received and is being processed';
      case 'Preparing': return 'The kitchen is preparing your order';
      case 'Ready': return 'Your order is ready! Please wait for service';
      case 'Served': return 'Your order has been served. Enjoy your meal!';
      case 'Paid': return 'Order completed. Thank you!';
      case 'Cancelled': return 'This order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>×{item.quantity}</Text>
      </View>
      
      <Text style={styles.itemPrice}>${item.base_price.toFixed(2)} each</Text>
      
      {/* Customizations */}
      {item.customizations && item.customizations.length > 0 && (
        <View style={styles.customizations}>
          {item.customizations.map((customization: any, index: number) => (
            <Text key={index} style={styles.customization}>
              • {customization.name}
              {customization.price_delta !== 0 && (
                <Text style={styles.customizationPrice}>
                  {' '}({customization.price_delta > 0 ? '+' : ''}${customization.price_delta.toFixed(2)})
                </Text>
              )}
            </Text>
          ))}
        </View>
      )}
      
      {/* Notes */}
      {item.notes && (
        <Text style={styles.itemNotes}>Note: {item.notes}</Text>
      )}
    </View>
  );

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order status...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadOrderStatus()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{orderId.slice(-8)}</Text>
        <Text style={styles.tableInfo}>Table {tableInfo.table.name}</Text>
      </View>

      {/* Status */}
      <View style={styles.statusSection}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status) }]} />
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>{order.status}</Text>
          <Text style={styles.statusMessage}>{getStatusMessage(order.status)}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <FlatList
          data={order.items}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrderStatus(true)}
            />
          }
        />
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.sub_total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total_amount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        {order.status === 'Served' && order.payment_status === 'Pending' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => navigation.navigate('Payment', { orderId, sessionToken, tableInfo })}
          >
            <Text style={styles.payButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        )}
        
        {(order.status === 'Pending' || order.status === 'Preparing') && (
          <TouchableOpacity
            style={styles.addItemsButton}
            onPress={() => navigation.navigate('Menu', { tableInfo, sessionToken })}
          >
            <Text style={styles.addItemsButtonText}>Add More Items</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.callStaffButton}
          onPress={() => Alert.alert('Call Staff', 'Staff has been notified and will assist you shortly.')}
        >
          <Text style={styles.callStaffButtonText}>Call Staff</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  tableInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  itemsSection: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: '#111827',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
  },
  customizations: {
    marginBottom: 8,
  },
  customization: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  customizationPrice: {
    color: '#059669',
  },
  itemNotes: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
    gap: 12,
  },
  payButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addItemsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addItemsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callStaffButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callStaffButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderStatusScreen;