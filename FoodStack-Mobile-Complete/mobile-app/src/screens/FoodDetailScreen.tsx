import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, MenuItem, TableInfo, ItemCustomizations, CustomizationGroup, CustomizationOption } from '../types';
import { publicApi } from '../services/api';
import { useCartContext } from '../context/CartContext';
import { theme } from '../theme';
import Icon from '../components/Icon';

type FoodDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodDetail'>;

interface Props {
  navigation: FoodDetailScreenNavigationProp;
  route: {
    params: {
      menuItem: MenuItem;
      tableInfo?: TableInfo;
      sessionToken?: string;
      restaurantId?: string;
      branchId?: string;
    };
  };
}

const { width } = Dimensions.get('window');

const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { menuItem, tableInfo, sessionToken } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{
    [groupId: string]: CustomizationOption[];
  }>({});
  const [notes, setNotes] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCartContext();

  // Fetch customizations for this menu item
  const { data: customizationsData, isLoading: customizationsLoading } = useQuery({
    queryKey: ['customizations', menuItem.id],
    queryFn: () => publicApi.getItemCustomizations(menuItem.id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const customizations = customizationsData?.customizations || [];

  // Calculate total price including customizations
  const calculateTotalPrice = (): number => {
    let basePrice = menuItem.price * quantity;
    
    Object.values(selectedCustomizations).forEach(options => {
      options.forEach(option => {
        basePrice += option.price_delta * quantity;
      });
    });

    return basePrice;
  };

  const totalPrice = calculateTotalPrice();

  // Handle customization selection
  const handleCustomizationSelect = (group: CustomizationGroup, option: CustomizationOption) => {
    setSelectedCustomizations(prev => {
      const newSelections = { ...prev };
      
      if (group.max_select === 1) {
        // Single selection - replace existing
        newSelections[group.group_id] = [option];
      } else {
        // Multiple selection
        const currentOptions = newSelections[group.group_id] || [];
        const optionIndex = currentOptions.findIndex(o => o.id === option.id);
        
        if (optionIndex >= 0) {
          // Remove if already selected
          newSelections[group.group_id] = currentOptions.filter(o => o.id !== option.id);
        } else {
          // Add if not at max limit
          if (currentOptions.length < group.max_select) {
            newSelections[group.group_id] = [...currentOptions, option];
          }
        }
      }

      return newSelections;
    });
  };

  // Check if customization is selected
  const isCustomizationSelected = (groupId: string, optionId: string): boolean => {
    const groupSelections = selectedCustomizations[groupId] || [];
    return groupSelections.some(option => option.id === optionId);
  };

  // Validate required customizations
  const validateCustomizations = (): boolean => {
    for (const group of customizations) {
      if (group.is_required) {
        const selections = selectedCustomizations[group.group_id] || [];
        if (selections.length < group.min_select) {
          Alert.alert(
            'Thiếu lựa chọn',
            `Vui lòng chọn ít nhất ${group.min_select} tùy chọn cho "${group.name}"`
          );
          return false;
        }
      }
    }
    return true;
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!validateCustomizations()) return;

    setIsAddingToCart(true);
    
    try {
      // Format customizations for cart
      const formattedCustomizations = customizations.map(group => ({
        group_id: group.group_id,
        group_name: group.name,
        options: selectedCustomizations[group.group_id] || []
      })).filter(group => group.options.length > 0);

      addToCart(menuItem, quantity, formattedCustomizations, notes || undefined);
      
      Alert.alert(
        'Đã thêm vào giỏ hàng',
        `${menuItem.name} đã được thêm vào giỏ hàng`,
        [
          { text: 'Tiếp tục mua', style: 'cancel' },
          { 
            text: 'Xem giỏ hàng', 
            onPress: () => navigation.navigate('Cart', {
              tableInfo,
              sessionToken,
              restaurantId: route.params.restaurantId,
              branchId: route.params.branchId,
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Chi tiết món ăn</Text>
        
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', {
            tableInfo,
            sessionToken,
            restaurantId: route.params.restaurantId,
            branchId: route.params.branchId,
          })}
        >
          <Icon name="cart" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        <View style={styles.imageContainer}>
          {menuItem.image_url ? (
            <Image
              source={{ uri: menuItem.image_url }}
              style={styles.foodImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={48} color="#ccc" />
            </View>
          )}
        </View>

        {/* Food Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.foodName}>{menuItem.name}</Text>
          {menuItem.description && (
            <Text style={styles.foodDescription}>{menuItem.description}</Text>
          )}
          <Text style={styles.basePrice}>
            Giá gốc: {menuItem.price.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {/* Customizations */}
        {customizationsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#E8622A" />
            <Text style={styles.loadingText}>Đang tải tùy chọn...</Text>
          </View>
        ) : customizations.length > 0 ? (
          <View style={styles.customizationsContainer}>
            <Text style={styles.sectionTitle}>Tùy chọn</Text>
            
            {customizations.map((group) => (
              <View key={group.group_id} style={styles.customizationGroup}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.is_required && (
                    <Text style={styles.requiredLabel}>Bắt buộc</Text>
                  )}
                </View>
                
                <Text style={styles.groupDescription}>
                  {group.max_select === 1 
                    ? 'Chọn 1 tùy chọn'
                    : `Chọn ${group.min_select}-${group.max_select} tùy chọn`
                  }
                </Text>

                {group.options.map((option) => {
                  const isSelected = isCustomizationSelected(group.group_id, option.id);
                  
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.customizationOption,
                        isSelected && styles.selectedOption
                      ]}
                      onPress={() => handleCustomizationSelect(group, option)}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[
                          styles.optionName,
                          isSelected && styles.selectedOptionText
                        ]}>
                          {option.name}
                        </Text>
                        {option.price_delta !== 0 && (
                          <Text style={[
                            styles.optionPrice,
                            isSelected && styles.selectedOptionText
                          ]}>
                            {option.price_delta > 0 ? '+' : ''}
                            {option.price_delta.toLocaleString('vi-VN')}đ
                          </Text>
                        )}
                      </View>
                      
                      <View style={[
                        styles.optionCheckbox,
                        isSelected && styles.selectedCheckbox
                      ]}>
                        {isSelected && (
                          <Icon name="check" size={12} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {/* Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú cho món ăn..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Icon name="minus" size={16} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Icon name="plus" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, isAddingToCart && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          <LinearGradient
            colors={['#FF7A30', '#E8622A']}
            style={styles.addToCartGradient}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                <Text style={styles.totalPriceText}>
                  {totalPrice.toLocaleString('vi-VN')}đ
                </Text>
              </>
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
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  
  cartButton: {
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
  
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
  },
  
  foodImage: {
    width: '100%',
    height: '100%',
  },
  
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  foodName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  
  foodDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  
  basePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Customizations
  customizationsContainer: {
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  
  customizationGroup: {
    marginBottom: 24,
  },
  
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  requiredLabel: {
    fontSize: 12,
    color: '#E8622A',
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  
  customizationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  
  selectedOption: {
    borderColor: '#E8622A',
    backgroundColor: '#FFF8F5',
  },
  
  optionInfo: {
    flex: 1,
  },
  
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  
  selectedOptionText: {
    color: '#E8622A',
  },
  
  optionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  optionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedCheckbox: {
    backgroundColor: '#E8622A',
    borderColor: '#E8622A',
  },
  
  // Notes
  notesContainer: {
    padding: 16,
  },
  
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
  },
  
  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 16,
  },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  
  addToCartButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  
  totalPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default FoodDetailScreen;