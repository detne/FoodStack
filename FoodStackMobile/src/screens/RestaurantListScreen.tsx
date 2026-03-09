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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { RESTAURANTS, RestaurantType } from '../constants/data';

type RestaurantListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantList'>;

interface Props {
  navigation: RestaurantListScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const RestaurantListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'fastfood', 'italian', 'japanese', 'healthy'];

  const filteredRestaurants = RESTAURANTS.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || restaurant.category === filter;
    return matchesSearch && matchesFilter;
  });

  const setSelectedRestaurant = (restaurant: RestaurantType) => {
    navigation.navigate('Menu', { restaurantId: restaurant.id.toString() });
  };

  const goBack = () => {
    navigation.goBack();
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
              <Icon name="back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn Nhà Hàng</Text>
            <View style={styles.headerBackButton} />
          </View>

          {/* Search in Header */}
          <View style={styles.headerSearchContainer}>
            <Icon name="search" size={16} color="#aaa" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm nhà hàng..."
              style={styles.headerSearchInput}
              placeholderTextColor="#aaa"
            />
          </View>
        </LinearGradient>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                filter === category && styles.activeFilterChip
              ]}
              onPress={() => setFilter(category)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterChipText,
                filter === category && styles.activeFilterChipText
              ]}>
                {category === 'All' ? 'Tất cả' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Restaurant List */}
      <ScrollView
        style={styles.restaurantList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.restaurantListContent}
      >
        {filteredRestaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No restaurants found</Text>
            <Text style={styles.emptyStateDescription}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          filteredRestaurants.map(restaurant => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => setSelectedRestaurant(restaurant)}
              activeOpacity={0.8}
            >
              <View style={[styles.restaurantImage, { backgroundColor: restaurant.color + '18', borderColor: restaurant.color + '22' }]}>
                <Text style={styles.restaurantEmoji}>{restaurant.img}</Text>
              </View>
              
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    restaurant.open ? styles.openBadge : styles.closedBadge
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      restaurant.open ? styles.openBadgeText : styles.closedBadgeText
                    ]}>
                      {restaurant.open ? 'MỞ CỬA' : 'ĐÓNG CỬA'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                
                <View style={styles.restaurantMeta}>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={12} color="#F4A261" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>📍 {restaurant.distance}</Text>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>⏱ {restaurant.time}</Text>
                </View>
              </View>
              <Icon name="chevron" size={16} color="#ddd" />
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
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

  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f5f5f0',
    whiteSpace: 'nowrap',
  },

  activeFilterChip: {
    backgroundColor: '#E8622A',
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },

  activeFilterChipText: {
    color: '#fff',
  },

  restaurantList: {
    flex: 1,
  },

  restaurantListContent: {
    padding: 14,
    paddingHorizontal: 16,
    gap: 12,
  },

  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...theme.shadows.sm,
  },

  restaurantImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },

  restaurantEmoji: {
    fontSize: 32,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
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

  openBadge: {
    backgroundColor: '#E8F5E9',
  },

  closedBadge: {
    backgroundColor: '#FFEBEE',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  openBadgeText: {
    color: '#2E7D32',
  },

  closedBadgeText: {
    color: '#C62828',
  },

  restaurantCuisine: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 6,
  },

  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },

  metaText: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '600',
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

export default RestaurantListScreen;