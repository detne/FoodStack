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
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type MenuManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MenuManagement'>;

interface Props {
  navigation: MenuManagementScreenNavigationProp;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  category: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

const MenuManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      // TODO: Implement API call to get menu data
      // Mock data for now
      setCategories([
        {
          id: '1',
          name: 'Món chính',
          items: [
            {
              id: '1',
              name: 'Phở bò',
              price: 65000,
              description: 'Phở bò truyền thống với nước dùng đậm đà',
              category: 'Món chính',
              available: true,
            },
            {
              id: '2',
              name: 'Cơm tấm',
              price: 45000,
              description: 'Cơm tấm sườn nướng, chả, bì',
              category: 'Món chính',
              available: true,
            },
          ],
        },
        {
          id: '2',
          name: 'Đồ uống',
          items: [
            {
              id: '3',
              name: 'Cà phê đen',
              price: 25000,
              description: 'Cà phê đen đá truyền thống',
              category: 'Đồ uống',
              available: true,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Error loading menu data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuData();
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    Alert.prompt(
      'Thêm danh mục',
      'Nhập tên danh mục mới:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: (categoryName) => {
            if (categoryName && categoryName.trim()) {
              // TODO: Implement API call to add category
              console.log('Add category:', categoryName);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleAddMenuItem = (categoryId: string) => {
    navigation.navigate('AddMenuItem', { categoryId });
  };

  const handleEditMenuItem = (item: MenuItem) => {
    navigation.navigate('EditMenuItem', { item });
  };

  const handleToggleAvailability = async (itemId: string, available: boolean) => {
    try {
      // TODO: Implement API call to toggle availability
      setCategories(prev =>
        prev.map(category => ({
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { ...item, available } : item
          ),
        }))
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái món ăn');
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    Alert.alert(
      'Xóa món ăn',
      'Bạn có chắc chắn muốn xóa món ăn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to delete item
              setCategories(prev =>
                prev.map(category => ({
                  ...category,
                  items: category.items.filter(item => item.id !== itemId),
                }))
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa món ăn');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
        <Text style={styles.headerTitle}>Quản lý Menu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategory}
        >
          <Icon name="plus" size={24} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => handleAddMenuItem(category.id)}
                >
                  <Icon name="plus" size={20} color="#FF7A30" />
                  <Text style={styles.addItemText}>Thêm món</Text>
                </TouchableOpacity>
              </View>

              {category.items.map((item) => (
                <View key={item.id} style={styles.menuItemCard}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemImage}>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.image} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Icon name="image" size={24} color="#ccc" />
                        </View>
                      )}
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                    </View>

                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={[
                          styles.availabilityButton,
                          item.available ? styles.availableButton : styles.unavailableButton,
                        ]}
                        onPress={() => handleToggleAvailability(item.id, !item.available)}
                      >
                        <Icon
                          name={item.available ? 'eye' : 'eye-off'}
                          size={16}
                          color="#fff"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditMenuItem(item)}
                      >
                        <Icon name="edit" size={16} color="#2196F3" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMenuItem(item.id)}
                      >
                        <Icon name="trash-2" size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {category.items.length === 0 && (
                <View style={styles.emptyCategory}>
                  <Text style={styles.emptyCategoryText}>
                    Chưa có món ăn nào trong danh mục này
                  </Text>
                  <TouchableOpacity
                    style={styles.addFirstItemButton}
                    onPress={() => handleAddMenuItem(category.id)}
                  >
                    <Text style={styles.addFirstItemText}>Thêm món đầu tiên</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {categories.length === 0 && (
            <View style={styles.emptyMenu}>
              <Icon name="book-open" size={64} color="#ccc" />
              <Text style={styles.emptyMenuTitle}>Menu trống</Text>
              <Text style={styles.emptyMenuText}>
                Bắt đầu bằng cách thêm danh mục đầu tiên
              </Text>
              <TouchableOpacity
                style={styles.addFirstCategoryButton}
                onPress={handleAddCategory}
              >
                <LinearGradient
                  colors={['#FF7A30', '#E8622A']}
                  style={styles.addFirstCategoryGradient}
                >
                  <Icon name="plus" size={20} color="#fff" />
                  <Text style={styles.addFirstCategoryText}>Thêm danh mục</Text>
                </LinearGradient>
              </TouchableOpacity>
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

  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  menuContainer: {
    padding: 20,
  },

  // Category Styles
  categorySection: {
    marginBottom: 24,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF7A30',
  },

  addItemText: {
    fontSize: 12,
    color: '#FF7A30',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Menu Item Styles
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
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

  itemContent: {
    flexDirection: 'row',
    padding: 12,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A30',
  },

  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  availabilityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  availableButton: {
    backgroundColor: '#4CAF50',
  },

  unavailableButton: {
    backgroundColor: '#9E9E9E',
  },

  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
  },

  // Empty States
  emptyCategory: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyCategoryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },

  addFirstItemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF7A30',
    borderRadius: 20,
  },

  addFirstItemText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  emptyMenu: {
    alignItems: 'center',
    paddingVertical: 64,
  },

  emptyMenuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyMenuText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  addFirstCategoryButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  addFirstCategoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },

  addFirstCategoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MenuManagementScreen;