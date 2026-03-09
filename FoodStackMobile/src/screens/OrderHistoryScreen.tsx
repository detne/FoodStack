import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { ORDER_HISTORY } from '../constants/data';

const { width } = Dimensions.get('window');

type OrderHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderHistory'>;

interface Props {
  navigation: OrderHistoryScreenNavigationProp;
}

const OrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState('All');
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filters = ['All', 'Active', 'Past', 'Cancelled'];

  const filteredOrders = ORDER_HISTORY.filter(order => {
    if (filter === 'All') return true;
    if (filter === 'Active') return order.status === 'PROCESSING';
    if (filter === 'Past') return order.status === 'SERVED' || order.status === 'PAID';
    if (filter === 'Cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const goBack = () => {
    navigation.navigate('Home');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'SERVED':
        return { backgroundColor: '#E8F5E9', color: '#2E7D32' };
      case 'PROCESSING':
        return { backgroundColor: '#FFF3E0', color: '#E65100' };
      case 'PAID':
        return { backgroundColor: '#E3F2FD', color: '#1565C0' };
      case 'CANCELLED':
        return { backgroundColor: '#FFEBEE', color: '#C62828' };
      default:
        return { backgroundColor: '#FFF9C4', color: '#F57F17' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
              activeOpacity={0.8}
            >
              <Icon name="back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Order History</Text>
              <Text style={styles.headerSubtitle}>Track your orders</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          {/* Enhanced Filter Tabs */}
          <View style={styles.filterTabs}>
            {filters.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, filter === f && styles.activeFilterTab]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterTabText, filter === f && styles.activeFilterTabText]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Enhanced Orders List */}
        <ScrollView
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersContent}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No orders found</Text>
              <Text style={styles.emptyStateDescription}>
                {filter === 'All' 
                  ? 'You haven\'t placed any orders yet'
                  : `No orders found in "${filter}" category`
                }
              </Text>
              <TouchableOpacity style={styles.browseButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF7A30', '#E8622A']}
                  style={styles.browseButtonGradient}
                >
                  <Text style={styles.browseButtonText}>Browse Restaurants</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersSection}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {filteredOrders.map((order, index) => {
                const statusStyle = getStatusBadgeStyle(order.status);
                
                return (
                  <Animated.View
                    key={order.id}
                    style={[
                      styles.orderCard,
                      {
                        transform: [{
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50 * (index + 1), 0],
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.orderRestaurant}>
                        <View style={styles.restaurantIcon}>
                          <Text style={styles.restaurantEmoji}>{order.restaurantEmoji}</Text>
                        </View>
                        <View style={styles.restaurantInfo}>
                          <View style={styles.restaurantNameRow}>
                            <Text style={styles.restaurantName}>{order.restaurant}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                              <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                                {order.status}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.orderDate}>{order.date} • {order.time}</Text>
                          <View style={styles.orderMeta}>
                            <Text style={styles.itemsCount}>{order.items} item{order.items > 1 ? 's' : ''}</Text>
                            <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Enhanced Action Buttons */}
                    {order.status === 'PROCESSING' ? (
                      <TouchableOpacity style={styles.trackButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['#FF7A30', '#E8622A']}
                          style={styles.trackButtonGradient}
                        >
                          <Icon name="track" size={16} color="#fff" />
                          <Text style={styles.trackButtonText}>Track Order</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.reorderButton} activeOpacity={0.8}>
                          <Icon name="reorder" size={14} color="#E8622A" />
                          <Text style={styles.reorderButtonText}>Reorder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.receiptButton} activeOpacity={0.8}>
                          <Icon name="receipt" size={14} color="#666" />
                          <Text style={styles.receiptButtonText}>Receipt</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Icon name="home" size={22} color="#aaa" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} activeOpacity={0.8}>
          <Icon name="orders" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Offers')}
          activeOpacity={0.8}
        >
          <Icon name="offers" size={22} color="#aaa" />
          <Text style={styles.navText}>Offers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Icon name="profile" size={22} color="#aaa" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  animatedContainer: {
    flex: 1,
  },

  // Enhanced Header Styles
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // Enhanced Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 4,
  },

  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
  },

  activeFilterTab: {
    backgroundColor: '#fff',
  },

  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },

  activeFilterTabText: {
    color: '#E8622A',
  },

  // Orders List
  ordersList: {
    flex: 1,
  },

  ordersContent: {
    padding: 16,
    paddingBottom: 100,
  },

  ordersSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#888',
    marginBottom: 12,
    paddingLeft: 4,
  },

  // Enhanced Order Cards
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  orderHeader: {
    marginBottom: 12,
  },

  orderRestaurant: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  restaurantIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
  },

  restaurantEmoji: {
    fontSize: 28,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  restaurantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  orderDate: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
    marginBottom: 6,
  },

  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemsCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  orderTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E8622A',
  },

  // Enhanced Action Buttons
  trackButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  trackButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  trackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: '#FFF0E8',
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },

  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8622A',
  },

  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: '#f5f5f0',
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  receiptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },

  // Enhanced Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },

  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },

  emptyStateDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  browseButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Bottom Navigation
  bottomNav: {
    height: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },

  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },

  activeNavText: {
    color: '#E8622A',
  },
});

export default OrderHistoryScreen;
