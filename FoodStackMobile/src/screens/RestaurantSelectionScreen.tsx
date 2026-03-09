import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type RestaurantSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantSelection'>;

interface Props {
  navigation: RestaurantSelectionScreenNavigationProp;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  emoji: string;
  tables: number;
}

// Mock data - replace with API call
const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Nhà hàng ABC',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    emoji: '🍜',
    tables: 20,
  },
  {
    id: '2',
    name: 'Quán Phở Hà Nội',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    emoji: '🍲',
    tables: 15,
  },
  {
    id: '3',
    name: 'Cơm Tấm Sài Gòn',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    emoji: '🍚',
    tables: 12,
  },
];

const RestaurantSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [tableNumber, setTableNumber] = useState('');

  const handleContinue = () => {
    if (!selectedRestaurant) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhà hàng');
      return;
    }

    if (!tableNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số bàn');
      return;
    }

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > selectedRestaurant.tables) {
      Alert.alert('Lỗi', `Số bàn phải từ 1 đến ${selectedRestaurant.tables}`);
      return;
    }

    // Navigate to menu with restaurant and table info
    navigation.navigate('Menu', {
      restaurantId: selectedRestaurant.id,
      tableInfo: {
        tableNumber: tableNum,
        restaurantName: selectedRestaurant.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Chọn nhà hàng</Text>
              <Text style={styles.headerSubtitle}>Duyệt menu</Text>
            </View>
            <View style={styles.backButton} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Restaurant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn nhà hàng</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn nhà hàng bạn đang ở để xem menu
          </Text>

          <View style={styles.restaurantList}>
            {RESTAURANTS.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={[
                  styles.restaurantCard,
                  selectedRestaurant?.id === restaurant.id && styles.selectedRestaurantCard,
                ]}
                onPress={() => setSelectedRestaurant(restaurant)}
                activeOpacity={0.7}
              >
                <View style={styles.restaurantEmoji}>
                  <Text style={styles.restaurantEmojiText}>{restaurant.emoji}</Text>
                </View>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
                  <Text style={styles.restaurantTables}>
                    {restaurant.tables} bàn
                  </Text>
                </View>
                {selectedRestaurant?.id === restaurant.id && (
                  <View style={styles.checkmark}>
                    <Icon name="check" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Table Number Input */}
        {selectedRestaurant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số bàn</Text>
            <Text style={styles.sectionSubtitle}>
              Nhập số bàn bạn đang ngồi (1-{selectedRestaurant.tables})
            </Text>

            <TextInput
              style={styles.tableInput}
              placeholder="Nhập số bàn"
              placeholderTextColor="#999"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        )}

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Icon name="info" size={18} color="#FF7A30" />
          <Text style={styles.infoText}>
            Đơn hàng của bạn sẽ cần được nhân viên xác nhận trước khi được xử lý
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedRestaurant && tableNumber && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF7A30', '#E8622A']}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Tiếp tục đặt món</Text>
              <Icon name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  header: {
    marginBottom: 20,
  },

  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
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

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },

  restaurantList: {
    gap: 12,
  },

  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },

  selectedRestaurantCard: {
    borderColor: '#FF7A30',
    backgroundColor: '#FFF5F0',
  },

  restaurantEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  restaurantEmojiText: {
    fontSize: 28,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  restaurantAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  restaurantTables: {
    fontSize: 11,
    color: '#FF7A30',
    fontWeight: '700',
  },

  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF7A30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tableInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },

  infoBox: {
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...theme.shadows.lg,
  },

  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },

  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },

  continueButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});

export default RestaurantSelectionScreen;
