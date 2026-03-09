import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { MENU_ITEMS, MENU_CATEGORIES, MenuItemType } from '../constants/data';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

interface Props {
  navigation: MenuScreenNavigationProp;
  route: {
    params: {
      restaurantId?: string;
      tableInfo?: any;
      sessionToken?: string;
    };
  };
}

const { width } = Dimensions.get('window');

const MENU_CATS_VI = { 
  All: "Tất cả", 
  Popular: "Phổ biến", 
  Main: "Món chính", 
  Sides: "Ăn kèm", 
  Drinks: "Đồ uống", 
  Desserts: "Tráng miệng" 
};

const MenuScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId, tableInfo } = route.params || {};
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(0);

  // Get restaurant name from tableInfo or use default
  const restaurantName = tableInfo?.restaurantName || "Selected Restaurant";

  // Debug: Log data
  console.log('MENU_ITEMS length:', MENU_ITEMS.length);
  console.log('restaurantId:', restaurantId);
  console.log('tableInfo:', tableInfo);
  console.log('category:', category);
  console.log('search:', search);

  // Filter menu items based on restaurant and search
  const menuItems = MENU_ITEMS.filter(item => {
    if (!item || !item.name || !item.desc) return false;
    
    // If no specific restaurant, show all items
    const matchesRestaurant = !restaurantId || item.restaurant.toString() === restaurantId;
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         item.desc.toLowerCase().includes(search.toLowerCase());
    
    return matchesRestaurant && matchesCategory && matchesSearch;
  });

  console.log('Filtered menuItems length:', menuItems.length);

  const goBack = () => {
    navigation.goBack();
  };

  const setSelectedItem = (item: MenuItemType) => {
    navigation.navigate('FoodDetail', { 
      menuItem: item as any,
      restaurantId,
      sessionToken: route.params?.sessionToken 
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gradient */}
      <View style={styles.headerGradient}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradientBackground}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={goBack}
              activeOpacity={0.8}
            >
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{restaurantName}</Text>
              <Text style={styles.headerSubtitle}>Duyệt menu</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.cartButton} 
              onPress={() => navigation.navigate('Cart', { restaurantId })}
              activeOpacity={0.8}
            >
              <View style={styles.cartButtonBackground}>
                <Icon name="cart" size={20} color="#fff" />
              </View>
              {cart > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search in Header */}
          <View style={styles.headerSearchContainer}>
            <Icon name="search" size={16} color="#aaa" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm món ăn..."
              style={styles.headerSearchInput}
              placeholderTextColor="#aaa"
            />
          </View>
        </LinearGradient>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {MENU_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.activeCategoryChip
              ]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryChipText,
                category === cat && styles.activeCategoryChipText
              ]}>
                {MENU_CATS_VI[cat] || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuListContent}
      >
        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🍽️</Text>
            <Text style={styles.emptyStateTitle}>Không tìm thấy món ăn</Text>
            <Text style={styles.emptyStateDescription}>
              Thử thay đổi từ khóa tìm kiếm hoặc danh mục
            </Text>
          </View>
        ) : (
          menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemImage}>
                <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
              </View>
              
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {MENU_CATS_VI[item.category] || item.category}
                  </Text>
                </View>
                
                <Text style={styles.menuItemDesc}>{item.desc}</Text>
                
                <View style={styles.menuItemFooter}>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  <View style={styles.addButton}>
                    <LinearGradient
                      colors={['#FF7A30', '#E8622A']}
                      style={styles.addButtonGradient}
                    >
                      <Icon name="plus" size={14} color="#fff" />
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
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

  headerGradient: {
    zIndex: 10,
  },

  headerGradientBackground: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  cartButton: {
    position: 'relative',
  },

  cartButtonBackground: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E8622A',
  },

  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },

  headerSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    ...theme.shadows.sm,
  },

  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f5f5f0',
  },

  activeCategoryChip: {
    backgroundColor: '#E8622A',
  },

  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },

  activeCategoryChipText: {
    color: '#fff',
  },

  menuList: {
    flex: 1,
  },

  menuListContent: {
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    ...theme.shadows.sm,
  },

  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  menuItemEmoji: {
    fontSize: 38,
  },

  menuItemInfo: {
    flex: 1,
  },

  menuItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0E8',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
  },

  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E8622A',
  },

  menuItemDesc: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 8,
  },

  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  menuItemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E8622A',
  },

  addButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },

  addButtonGradient: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  },
});

export default MenuScreen;