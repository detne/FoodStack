import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type RestaurantListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantList'>;

interface Props {
  navigation: RestaurantListScreenNavigationProp;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  cuisine_type: string;
  delivery_time: string;
  distance: string;
  is_open: boolean;
}

const RestaurantListScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - trong thực tế sẽ fetch từ API
  const restaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Nhà hàng Sài Gòn',
      description: 'Món Việt truyền thống, phở, bún bò Huế',
      image_url: 'https://via.placeholder.com/300x200?text=Saigon+Restaurant',
      rating: 4.5,
      cuisine_type: 'Việt Nam',
      delivery_time: '20-30 phút',
      distance: '0.5 km',
      is_open: true,
    },
    {
      id: '2',
      name: 'Pizza House',
      description: 'Pizza Ý chính gốc, pasta, salad',
      image_url: 'https://via.placeholder.com/300x200?text=Pizza+House',
      rating: 4.2,
      cuisine_type: 'Ý',
      delivery_time: '25-35 phút',
      distance: '1.2 km',
      is_open: true,
    },
    {
      id: '3',
      name: 'Sushi Tokyo',
      description: 'Sushi, sashimi, ramen Nhật Bản',
      image_url: 'https://via.placeholder.com/300x200?text=Sushi+Tokyo',
      rating: 4.7,
      cuisine_type: 'Nhật Bản',
      delivery_time: '30-40 phút',
      distance: '2.1 km',
      is_open: false,
    },
    {
      id: '4',
      name: 'Burger King',
      description: 'Burger, khoai tây chiên, gà rán',
      image_url: 'https://via.placeholder.com/300x200?text=Burger+King',
      rating: 4.0,
      cuisine_type: 'Fast Food',
      delivery_time: '15-25 phút',
      distance: '0.8 km',
      is_open: true,
    },
    {
      id: 'demo',
      name: 'FoodStack Demo',
      description: 'Nhà hàng demo để test ứng dụng',
      image_url: 'https://via.placeholder.com/300x200?text=Demo+Restaurant',
      rating: 5.0,
      cuisine_type: 'Demo',
      delivery_time: '5-10 phút',
      distance: '0.1 km',
      is_open: true,
    },
  ];

  const categories = ['Tất cả', 'Việt Nam', 'Ý', 'Nhật Bản', 'Fast Food', 'Demo'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Tất cả' || 
                           restaurant.cuisine_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={[styles.restaurantCard, !item.is_open && styles.closedCard]}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          {!item.is_open && <Text style={styles.closedBadge}>Đóng cửa</Text>}
        </View>
        <Text style={styles.restaurantDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
          <Text style={styles.metaText}>{item.cuisine_type}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.delivery_time}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.selectedCategoryChip,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhà hàng</Text>
        <Text style={styles.headerSubtitle}>Khám phá các nhà hàng gần bạn</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhà hàng, món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Restaurants */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        style={styles.restaurantsList}
        contentContainerStyle={styles.restaurantsContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('QRScan')}
        >
          <Text style={styles.quickActionIcon}>📱</Text>
          <Text style={styles.quickActionText}>Quét QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Menu', { restaurantId: 'demo' })}
        >
          <Text style={styles.quickActionIcon}>🍽️</Text>
          <Text style={styles.quickActionText}>Menu Demo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  categoriesList: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCategoryChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  restaurantsList: {
    flex: 1,
  },
  restaurantsContent: {
    padding: 20,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  closedCard: {
    opacity: 0.7,
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closedBadge: {
    fontSize: 12,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rating: {
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default RestaurantListScreen;