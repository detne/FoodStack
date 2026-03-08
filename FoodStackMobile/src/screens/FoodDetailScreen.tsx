import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, CustomizationGroup, CustomizationOption } from '../types';
import { publicApi } from '../services/api';
import { useCartContext } from '../context/CartContext';

type FoodDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodDetail'>;
type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;

interface Props {
  navigation: FoodDetailScreenNavigationProp;
  route: FoodDetailScreenRouteProp;
}

const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { menuItem, tableInfo, sessionToken } = route.params;
  const { addToCart } = useCartContext();
  
  const [customizations, setCustomizations] = useState<CustomizationGroup[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{
    [groupId: string]: CustomizationOption[];
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomizations();
  }, []);

  const loadCustomizations = async () => {
    try {
      setLoading(true);
      const data = await publicApi.getItemCustomizations(menuItem.id);
      setCustomizations(data.customizations);
    } catch (error) {
      console.error('Load customizations error:', error);
      // Continue without customizations
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizationSelect = (groupId: string, option: CustomizationOption, group: CustomizationGroup) => {
    setSelectedCustomizations(prev => {
      const currentSelections = prev[groupId] || [];
      
      if (group.max_select === 1) {
        // Single select - replace selection
        return {
          ...prev,
          [groupId]: [option],
        };
      } else {
        // Multi select
        const isSelected = currentSelections.some(selected => selected.id === option.id);
        
        if (isSelected) {
          // Remove selection
          return {
            ...prev,
            [groupId]: currentSelections.filter(selected => selected.id !== option.id),
          };
        } else {
          // Add selection if under limit
          if (currentSelections.length < group.max_select) {
            return {
              ...prev,
              [groupId]: [...currentSelections, option],
            };
          }
        }
      }
      
      return prev;
    });
  };

  const validateSelections = (): boolean => {
    for (const group of customizations) {
      const selections = selectedCustomizations[group.group_id] || [];
      
      if (group.is_required && selections.length < group.min_select) {
        Alert.alert('Required Selection', `Please select at least ${group.min_select} option(s) for ${group.name}`);
        return false;
      }
    }
    return true;
  };

  const calculateTotalPrice = (): number => {
    let total = menuItem.price * quantity;
    
    Object.values(selectedCustomizations).forEach(options => {
      options.forEach(option => {
        total += option.price_delta * quantity;
      });
    });
    
    return total;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) return;
    
    const formattedCustomizations = Object.entries(selectedCustomizations).map(([groupId, options]) => {
      const group = customizations.find(g => g.group_id === groupId);
      return {
        group_id: groupId,
        group_name: group?.name || '',
        options,
      };
    }).filter(group => group.options.length > 0);

    addToCart(menuItem, quantity, formattedCustomizations, notes);
    
    Alert.alert(
      'Added to Cart',
      `${menuItem.name} has been added to your cart`,
      [
        { text: 'Continue Shopping', onPress: () => navigation.goBack() },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart', { tableInfo, sessionToken }) },
      ]
    );
  };

  const renderCustomizationGroup = (group: CustomizationGroup) => (
    <View key={group.group_id} style={styles.customizationGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group.name}</Text>
        {group.is_required && <Text style={styles.requiredLabel}>Required</Text>}
      </View>
      <Text style={styles.groupDescription}>
        Select {group.min_select === group.max_select 
          ? group.min_select 
          : `${group.min_select}-${group.max_select}`} option(s)
      </Text>
      
      {group.options.map(option => {
        const isSelected = (selectedCustomizations[group.group_id] || [])
          .some(selected => selected.id === option.id);
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.customizationOption, isSelected && styles.selectedOption]}
            onPress={() => handleCustomizationSelect(group.group_id, option, group)}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionName, isSelected && styles.selectedOptionText]}>
                {option.name}
              </Text>
              {option.price_delta !== 0 && (
                <Text style={[styles.optionPrice, isSelected && styles.selectedOptionText]}>
                  {option.price_delta > 0 ? '+' : ''}${option.price_delta.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Food Image */}
        {menuItem.image_url && (
          <Image source={{ uri: menuItem.image_url }} style={styles.foodImage} />
        )}
        
        {/* Food Info */}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{menuItem.name}</Text>
          <Text style={styles.foodPrice}>${menuItem.price.toFixed(2)}</Text>
          {menuItem.description && (
            <Text style={styles.foodDescription}>{menuItem.description}</Text>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customizations */}
        {!loading && customizations.length > 0 && (
          <View style={styles.customizationsSection}>
            <Text style={styles.sectionTitle}>Customizations</Text>
            {customizations.map(renderCustomizationGroup)}
          </View>
        )}
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>
            Add to Cart - ${calculateTotalPrice().toFixed(2)}
          </Text>
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
  content: {
    flex: 1,
  },
  foodImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  foodInfo: {
    padding: 20,
    backgroundColor: '#fff',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  foodPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 12,
  },
  foodDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  quantitySection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 20,
  },
  customizationsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  customizationGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  requiredLabel: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  customizationOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addToCartButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FoodDetailScreen;