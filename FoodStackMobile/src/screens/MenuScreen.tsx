import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Category, MenuItem } from '../types';
import { publicApi } from '../services/api';
import { useCartContext } from '../context/CartContext';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;
type MenuScreenRouteProp = RouteProp<RootStackParamList, 'Menu'>;

interface Props {
  navigation: MenuScreenNavigationProp;
  route: MenuScreenRouteProp;
}

const MenuScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo, sessionToken, restaurantId, branchId } = route.params;
  const { getTotalItems } = useCartContext();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Determine if this is QR-based ordering or regular menu browsing
  const isQROrdering = !!(tableInfo && sessionToken);
  const targetBranchId = branchId || tableInfo?.branch.id || 'demo-branch';
  const restaurantName = tableInfo?.restaurant.name || 'Demo Restaurant';

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      
      if (targetBranchId === 'demo-branch' || restaurantId === 'demo') {
        // Load demo menu data
        const demoCategories: Category[] = [
          {
            id: 'cat-1',
            name: 'Món chính',
            description: 'Các món ăn chính',
            sort_order: 1,
            menu_items: [
              {
                id: 'item-1',
                name: 'Demo Burger',
                price: 120000,
                description: 'Burger demo với thịt bò, rau xanh và sốt đặc biệt',
                image_url: 'https://via.placeholder.com/300x200?text=Demo+Burger',
                sort_order: 1,
              },
              {
                id: 'item-2',
                name: 'Demo Pizza',
                price: 180000,
                description: 'Pizza demo với phô mai và các loại rau củ tươi',
                image_url: 'https://via.placeholder.com/300x200?text=Demo+Pizza',
                sort_order: 2,
              },
            ],
          },
          {
            id: 'cat-2',
            name: 'Đồ uống',
            description: 'Các loại đồ uống',
            sort_order: 2,
            menu_items: [
              {
                id: 'item-3',
                name: 'Demo Smoothie',
                price: 45000,
                description: 'Sinh tố trái cây tươi mát',
                image_url: 'https://via.placeholder.com/300x200?text=Demo+Smoothie',
                sort_order: 1,
              },
            ],
          },
        ];
        setCategories(demoCategories);
      } else {
        // Load real menu data from API
        const menuData = await publicApi.getMenu(targetBranchId);
        setCategories(menuData.categories);
      }
    } catch (error) {
      console.error('Load menu error:', error);
      Alert.alert('Error', 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    
    if (searchQuery) {
      return category.menu_items.some(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });

  const filteredItems = filteredCategories.flatMap(category =>
    category.menu_items.filter(item =>
      !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({ ...item, categoryName: category.name }))
  );

  const renderCategoryTab = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.selectedCategoryTabText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem & { categoryName: string } }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() =>
        navigation.navigate('FoodDetail', {
          menuItem: item,
          tableInfo,
          sessionToken,
          restaurantId,
          branchId,
        })
      }
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemCategory}>{item.categoryName}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.menuItemPrice}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.menuItemImage} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tableInfo}>
          <Text style={styles.tableName}>
            {isQROrdering ? `Bàn ${tableInfo?.table.name}` : restaurantName}
          </Text>
          <Text style={styles.branchName}>
            {isQROrdering ? tableInfo?.branch.name : 'Duyệt menu'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { 
            tableInfo, 
            sessionToken, 
            restaurantId, 
            branchId 
          })}
        >
          <Text style={styles.cartButtonText}>Giỏ hàng ({getTotalItems()})</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Tabs */}
      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      />

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        style={styles.menuList}
        contentContainerStyle={styles.menuListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  branchName: {
    fontSize: 14,
    color: '#6b7280',
  },
  cartButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoryTabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedCategoryTab: {
    backgroundColor: '#3b82f6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedCategoryTabText: {
    color: '#fff',
  },
  menuList: {
    flex: 1,
  },
  menuListContent: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default MenuScreen;