import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CartItem, OrderItem } from '../types';
import { useCartContext } from '../context/CartContext';
import { orderApi } from '../services/api';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;
type CartScreenRouteProp = RouteProp<RootStackParamList, 'Cart'>;

interface Props {
  navigation: CartScreenNavigationProp;
  route: CartScreenRouteProp;
}

const CartScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo, sessionToken } = route.params;
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartContext();
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order');
      return;
    }

    try {
      setLoading(true);

      // Convert cart items to order items
      const orderItems: OrderItem[] = cartItems.map(cartItem => ({
        menu_item_id: cartItem.menu_item.id,
        quantity: cartItem.quantity,
        notes: cartItem.notes,
        customizations: cartItem.selected_customizations.flatMap(group =>
          group.options.map(option => ({
            option_id: option.id,
          }))
        ),
      }));

      // Create order
      const orderResult = await orderApi.createOrder(sessionToken, orderItems, orderNotes);

      // Clear cart
      clearCart();

      // Navigate to order status
      navigation.replace('OrderStatus', {
        orderId: orderResult.order_id,
        sessionToken,
        tableInfo,
      });

    } catch (error) {
      console.error('Place order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.menu_item.name}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(index)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemPrice}>${item.menu_item.price.toFixed(2)} each</Text>

      {/* Customizations */}
      {item.selected_customizations.map(group => (
        <View key={group.group_id} style={styles.customizationGroup}>
          <Text style={styles.customizationGroupName}>{group.group_name}:</Text>
          {group.options.map(option => (
            <Text key={option.id} style={styles.customizationOption}>
              • {option.name}
              {option.price_delta !== 0 && (
                <Text style={styles.customizationPrice}>
                  {' '}({option.price_delta > 0 ? '+' : ''}${option.price_delta.toFixed(2)})
                </Text>
              )}
            </Text>
          ))}
        </View>
      ))}

      {/* Notes */}
      {item.notes && (
        <Text style={styles.itemNotes}>Note: {item.notes}</Text>
      )}

      {/* Quantity Controls */}
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(index, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(index, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.itemTotal}>${item.total_price.toFixed(2)}</Text>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Order</Text>
        <Text style={styles.tableInfo}>Table {tableInfo.table.name}</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(_, index) => index.toString()}
        style={styles.cartList}
        contentContainerStyle={styles.cartListContent}
      />

      {/* Order Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>Order Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any special requests or dietary requirements..."
          value={orderNotes}
          onChangeText={setOrderNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.clearCartButton}
            onPress={() => {
              Alert.alert(
                'Clear Cart',
                'Are you sure you want to remove all items?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearCart },
                ]
              );
            }}
          >
            <Text style={styles.clearCartButtonText}>Clear Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.placeOrderButton, loading && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <Text style={styles.placeOrderButtonText}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  continueShoppingButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingButtonText: {
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  tableInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
  },
  cartItem: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
  },
  customizationGroup: {
    marginBottom: 8,
  },
  customizationGroupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  customizationOption: {
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
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  notesSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearCartButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearCartButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  placeOrderButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;