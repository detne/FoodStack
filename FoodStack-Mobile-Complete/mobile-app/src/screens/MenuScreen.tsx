import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, TableInfo, MenuData, MenuItem, Category } from '../types';
import { publicApi, storage, branchApi } from '../services/api';
import { useCartContext } from '../context/CartContext';
import { theme } from '../theme';
import Icon from '../components/Icon';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

interface Props {
  navigation: MenuScreenNavigationProp;
  route: {
    params: {
      tableInfo?: TableInfo;
      sessionToken?: string;
      restaurantId?: string;
      branchId?: string;
    };
  };
}

const { width } = Dimensions.get('window');

const MenuScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableInfo, sessionToken, branchId } = route.params || {};
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use cart context
  const { getTotalItems } = useCartContext();
  const cartCount = getTotalItems();

  // Get branch ID from tableInfo or route params
  const currentBranchId = branchId || tableInfo?.branch?.id;

  // Fetch menu data
  const { data: menuData, isLoading, error, refetch } = useQuery({
    queryKey: ['menu', currentBranchId],
    queryFn: () => branchApi.getBranchMenu(currentBranchId!),
    enabled: !!currentBranchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set default category when menu loads
  useEffect(() => {
    if (menuData?.success && menuData.data?.categories && menuData.data.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(menuData.data.categories[0].id);
    }
  }, [menuData, selectedCategory]);

  // Filter menu items based on search
  const getFilteredItems = (category: Category): MenuItem[] => {
    if (!searchQuery) return category.menu_items;
    
    return category.menu_items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleItemPress = (item: MenuItem) => {
    navigation.navigate('FoodDetail', {
      menuItem: item,
      tableInfo,
      sessionToken,
      restaurantId: tableInfo?.restaurant?.id,
      branchId: currentBranchId,
    });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart', {
      tableInfo,
      sessionToken,
      restaurantId: tableInfo?.restaurant?.id,
      branchId: currentBranchId,
    });
  };

  if (!currentBranchId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Lỗi</Text>
          <Text style={styles.errorMessage}>Không tìm thấy thông tin chi nhánh</Text>
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
          <Text style={styles.loadingText}>Đang tải menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Không thể tải menu</Text>
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

  if (!menuData || !menuData.success || !menuData.data?.categories || menuData.data.categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🍽️</Text>
          <Text style={styles.errorTitle}>Menu trống</Text>
          <Text style={styles.errorMessage}>Nhà hàng chưa có món ăn nào</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#FF7A30', '#E8622A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>
              {tableInfo?.restaurant?.name || 'Menu'}
            </Text>
            {tableInfo && (
              <Text style={styles.tableInfo}>
                Bàn {tableInfo.table.name} - {tableInfo.branch.name}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleCartPress}
          >
            <Icon name="cart" size={20} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món ăn..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {menuData.data.categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuData.data.categories
          .filter(category => selectedCategory === category.id)
          .map((category) => {
            const filteredItems = getFilteredItems(category);
            
            if (filteredItems.length === 0) {
              return (
                <View key={category.id} style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    {searchQuery ? 'Không tìm thấy món ăn phù hợp' : 'Danh mục trống'}
                  </Text>
                </View>
              );
            }

            return (
              <View key={category.id}>
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        {item.description && (
                          <Text style={styles.menuItemDescription}>
                            {item.description}
                          </Text>
                        )}
                        <Text style={styles.menuItemPrice}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                      
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.menuItemImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.menuItemImagePlaceholder}>
                          <Icon name="image" size={24} color="#ccc" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  
  restaurantName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  
  tableInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  // Search styles
  searchContainer: {
    marginBottom: 8,
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  
  // Categories styles
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  
  selectedCategoryButton: {
    backgroundColor: '#E8622A',
  },
  
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  selectedCategoryText: {
    color: '#fff',
  },
  
  // Menu styles
  menuContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  menuItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  menuItemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Loading styles
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
  
  // Error styles
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
  
  // No results styles
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MenuScreen;