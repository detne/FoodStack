import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { CONFIG } from '../../config';

// API Configuration for different environments
export const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development URLs - sử dụng IP từ config
    const ANDROID_EMULATOR_URL = 'http://10.0.2.2:3000';
    const IOS_SIMULATOR_URL = 'http://localhost:3000';
    const PHYSICAL_DEVICE_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}`;
    const EXPO_GO_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}`;
    
    // Kiểm tra nếu đang chạy trên Expo Go
    if (Constants.appOwnership === 'expo') {
      return EXPO_GO_URL;
    }
    
    if (Platform.OS === 'android') {
      // Kiểm tra emulator hay thiết bị thật
      if (Constants.isDevice) {
        return PHYSICAL_DEVICE_URL;
      } else {
        return ANDROID_EMULATOR_URL;
      }
    } else if (Platform.OS === 'ios') {
      return IOS_SIMULATOR_URL;
    } else {
      return 'http://localhost:3000'; // Web
    }
  } else {
    // Production URL
    return 'https://your-production-api.com';
  }
};

// Test QR tokens for development
export const TEST_QR_TOKENS = CONFIG.TEST_QR_TOKENS;

// Mock data for testing without backend
export const MOCK_TABLE_DATA = {
  [TEST_QR_TOKENS.TABLE_1]: {
    table: {
      id: 'table-1',
      name: 'T01',
      capacity: 4,
      status: 'Available',
      area: {
        id: 'area-1',
        name: 'Main Hall'
      }
    },
    branch: {
      id: 'branch-1',
      name: 'Downtown Branch',
      restaurant_id: 'restaurant-1',
      restaurant: {
        id: 'restaurant-1',
        name: 'FoodStack Demo Restaurant',
        logo_url: 'https://via.placeholder.com/100x100?text=FS'
      }
    }
  }
};