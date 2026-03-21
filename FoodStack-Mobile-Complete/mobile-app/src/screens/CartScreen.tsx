import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, TableInfo, OrderItem } from '../types';
import { orderApi, storage } from '../services/api';
import { useCartContext } from '../context/CartContext';
import { theme } from '../theme';
import Icon from '../components/Icon';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

interface Props {
  navigation: CartScreenNavigationProp;
  route: {
    params: {
      tableInfo?: TableInfo;
      sessionToken?: string;
      restaurantId?: string;
      branchId?: string;
    };
  };
}

const CartScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo, sessionToken } = route.params || {};
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    getTotalItems,
    clearCart 
  } = useCartContext();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Xóa món khỏi giỏ hàng',
        'Bạn có chắc chắn muốn xóa món này?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(index) }
        ]
      );
    } else {
      updateQuantity(index, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món vào giỏ hàng trước khi đặt hàng');
      return;
    }

    if (!sessionToken) {
      Alert.alert('Lỗi', 'Không tìm thấy session. Vui lòng quét lại mã QR');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Convert cart items to order items format
      const orderItems: OrderItem[] = cartItems.map(cartItem => ({
        menu_item_id: cartItem.menu_item.id,
        quantity: cartItem.quantity,
        notes: cartItem.notes,
        customizations: cartItem.selected_customizations.flatMap(group =>
          group.options.map(option => ({
            option_id: option.id
          }))
        )
      }));

      // Create order
      const orderResult = await orderApi.createOrder(
        sessionToken,
        orderItems,
        'Đặt hàng từ mobile app'
      );

      // Clear cart after successful order
      clearCart();

      // Navigate to order status
      navigation.replace('OrderStatus', {
        orderId: orderResult.order_id,
        sessionToken,
        tableInfo,
      });

      Alert.alert(
        'Đặt hàng thành công!',
        `Đơn hàng #${orderResult.order_id} đã được tạo. Tổng tiền: ${orderResult.total_amount.toLocaleString('vi-VN')}đ`
      );

    } catch (error) {
      console.error('Place order error:', error);
      Alert.alert(
        'Lỗi đặt hàng',
        error instanceof Error ? error.message : 'Không thể đặt hàng. Vui lòng thử lại.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xóa toàn bộ giỏ hàng',
      'Bạn có chắc chắn muốn xóa tất cả món trong giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa tất cả', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyMessage}>
            Hãy thêm món ăn vào giỏ hàng để bắt đầu đặt hàng
          </Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <Text style={styles.headerTitle}>
          Giỏ hàng ({totalItems} món)
        </Text>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
        >
          <Icon name="trash" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Table Info */}
      {tableInfo && (
        <View style={styles.tableInfoContainer}>
          <Icon name="table" size={16} color="#E8622A" />
          <Text style={styles.tableInfoText}>
            Bàn {tableInfo.table.name} - {tableInfo.restaurant.name}
          </Text>
        </View>
      )}

      {/* Cart Items */}
      <ScrollView style={styles.cartItemsContainer} showsVerticalScrollIndicator={false}>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.cartItem}>
            <View style={styles.itemImageContainer}>
              {item.menu_item.image_url ? (
                <Image
                  source={{ uri: item.menu_item.image_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Icon name="image" size={20} color="#ccc" />
                </View>
              )}
            </View>

            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.menu_item.name}</Text>
              
              {/* Customizations */}
              {item.selected_customizations.length > 0 && (
                <View style={styles.customizationsContainer}>
                  {item.selected_customizations.map((group, groupIndex) => (
                    <View key={groupIndex}>
                      {group.options.map((option, optionIndex) => (
                        <Text key={optionIndex} style={styles.customizationText}>
                          • {option.name}
                          {option.price_delta !== 0 && (
                            <Text style={styles.customizationPrice}>
                              {' '}({option.price_delta > 0 ? '+' : ''}
                              {option.price_delta.toLocaleString('vi-VN')}đ)
                            </Text>
                          )}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Notes */}
              {item.notes && (
                <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
              )}

              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  {item.total_price.toLocaleString('vi-VN')}đ
                </Text>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(index, item.quantity - 1)}
                  >
                    <Icon name="minus" size={14} color="#333" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(index, item.quantity + 1)}
                  >
                    <Icon name="plus" size={14} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính ({totalItems} món)</Text>
            <Text style={styles.summaryValue}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí dịch vụ (5%)</Text>
            <Text style={styles.summaryValue}>
              {Math.round(totalPrice * 0.05).toLocaleString('vi-VN')}đ
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {Math.round(totalPrice * 1.05).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacingOrder && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          <LinearGradient
            colors={['#FF7A30', '#E8622A']}
            style={styles.placeOrderGradient}
          >
            {isPlacingOrder ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Đặt hàng ngay</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholder: {
    width: 40,
  },
  
  // Table Info
  tableInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF8F5',
    gap: 8,
  },
  
  tableInfoText: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '500',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  continueShoppingButton: {
    backgroundColor: '#E8622A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Cart Items
  cartItemsContainer: {
    flex: 1,
  },
  
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  itemImageContainer: {
    marginRight: 12,
  },
  
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  itemDetails: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
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
  
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 2,
  },
  
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  
  // Bottom Container
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  summaryContainer: {
    marginBottom: 16,
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
  
  placeOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  placeOrderGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  placeOrderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CartScreen;