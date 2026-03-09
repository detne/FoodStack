import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type RestaurantDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantDetail'>;
type RestaurantDetailScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

interface Props {
  navigation: RestaurantDetailScreenNavigationProp;
  route: RestaurantDetailScreenRouteProp;
}

const RestaurantDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId } = route.params;

  // Mock data - trong thực tế sẽ fetch từ API
  const restaurant = {
    id: restaurantId,
    name: restaurantId === 'demo' ? 'FoodStack Demo' : 'Nhà hàng Sài Gòn',
    description: 'Nhà hàng demo để test ứng dụng với đầy đủ tính năng',
    image_url: 'https://via.placeholder.com/400x200?text=Demo+Restaurant',
    rating: 5.0,
    cuisine_type: 'Demo',
    delivery_time: '5-10 phút',
    distance: '0.1 km',
    is_open: true,
    address: '123 Demo Street, Demo City',
    phone: '+84 123 456 789',
    opening_hours: '8:00 - 22:00',
    features: ['WiFi miễn phí', 'Điều hòa', 'Bãi đỗ xe', 'Thanh toán QR'],
  };

  const branches = [
    {
      id: 'branch-1',
      name: 'Chi nhánh chính',
      address: '123 Demo Street, Demo City',
      distance: '0.1 km',
      is_open: true,
    },
    {
      id: 'branch-2',
      name: 'Chi nhánh Quận 1',
      address: '456 Main Street, District 1',
      distance: '2.5 km',
      is_open: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Image */}
        <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
            </View>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
            </View>
          </View>

          <Text style={styles.description}>{restaurant.description}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕒</Text>
              <Text style={styles.metaText}>{restaurant.delivery_time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{restaurant.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📞</Text>
              <Text style={styles.metaText}>{restaurant.phone}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏰</Text>
              <Text style={styles.metaText}>{restaurant.opening_hours}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.featuresContainer}>
            {restaurant.features.map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Branches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi nhánh</Text>
          {branches.map((branch) => (
            <View key={branch.id} style={styles.branchCard}>
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchAddress}>{branch.address}</Text>
                <Text style={styles.branchDistance}>{branch.distance}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewMenuButton}
                onPress={() => navigation.navigate('Menu', { 
                  restaurantId: restaurant.id,
                  branchId: branch.id 
                })}
              >
                <Text style={styles.viewMenuButtonText}>Xem menu</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Menu', { 
              restaurantId: restaurant.id,
              branchId: 'branch-1' 
            })}
          >
            <Text style={styles.primaryButtonText}>Xem menu & Đặt món</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('QRScan')}
          >
            <Text style={styles.secondaryButtonText}>Quét QR tại bàn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cuisineType: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  rating: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#374151',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  featureText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  branchAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  branchDistance: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewMenuButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewMenuButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantDetailScreen;