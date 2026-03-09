import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type FoodDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodDetail'>;

interface Props {
  navigation: FoodDetailScreenNavigationProp;
  route: {
    params: {
      menuItem: any;
      restaurantId?: string;
      sessionToken?: string;
    };
  };
}

const { width } = Dimensions.get('window');

const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { menuItem: item } = route.params;
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<{[key: string]: string}>({});

  if (!item) return null;

  const total = item.price * qty;

  const setOption = (groupName: string, option: string) => {
    setSelections(s => ({ ...s, [groupName]: option }));
  };

  const addToCart = () => {
    // Add to cart logic here
    navigation.goBack();
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Food Image Header */}
      <View style={styles.imageHeader}>
        <LinearGradient
          colors={['#f8f8f8', '#eeeeee']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imageBackground}
        >
          <Text style={styles.foodEmoji}>{item.emoji}</Text>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <Icon name="back" size={20} color="#333" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Food Info */}
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.foodDesc}>{item.desc}</Text>
      </View>

      {/* Customizations */}
      <ScrollView
        style={styles.customizationsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.customizationsContent}
      >
        {item.customizations && item.customizations.length > 0 && (
          item.customizations.map((group: any) => (
            <View key={group.name} style={styles.customizationGroup}>
              <View style={styles.customizationHeader}>
                <Text style={styles.customizationTitle}>{group.name}</Text>
                {group.required && (
                  <Text style={styles.requiredLabel}>• Required</Text>
                )}
              </View>
              
              <View style={styles.optionsContainer}>
                {group.options.map((option: string) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selections[group.name] === option && styles.selectedOption
                    ]}
                    onPress={() => setOption(group.name, option)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.optionText,
                      selections[group.name] === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Quantity & Add to Cart */}
      <View style={styles.bottomSection}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQty(q => Math.max(1, q - 1))}
            activeOpacity={0.8}
          >
            <Icon name="minus" size={16} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{qty}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQty(q => q + 1)}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={16} color="#E8622A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCart}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF7A30', '#E8622A']}
            style={styles.addToCartGradient}
          >
            <Text style={styles.addToCartText}>
              Add to Cart • ${total.toFixed(2)}
            </Text>
          </LinearGradient>
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

  imageHeader: {
    height: 240,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },

  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  foodEmoji: {
    fontSize: 100,
  },

  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  foodInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.sm,
  },

  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  foodName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    flex: 1,
  },

  foodPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#E8622A',
  },

  foodDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  customizationsContainer: {
    flex: 1,
  },

  customizationsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  customizationGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },

  customizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  customizationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },

  requiredLabel: {
    fontSize: 11,
    color: '#E8622A',
    fontWeight: '700',
    marginLeft: 4,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },

  selectedOption: {
    borderColor: '#E8622A',
    backgroundColor: '#FFF0E8',
  },

  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },

  selectedOptionText: {
    color: '#E8622A',
  },

  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...theme.shadows.lg,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },

  quantityButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    minWidth: 20,
    textAlign: 'center',
  },

  addToCartButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },

  addToCartGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  addToCartText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
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

export default FoodDetailScreen;