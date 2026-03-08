// API Configuration for different environments
export const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development URLs
    const ANDROID_EMULATOR_URL = 'http://10.0.2.2:3000/api/v1';
    const IOS_SIMULATOR_URL = 'http://localhost:3000/api/v1';
    const PHYSICAL_DEVICE_URL = 'http://192.168.1.100:3000/api/v1'; // Replace with your computer's IP
    
    // Auto-detect platform
    const { Platform } = require('react-native');
    
    if (Platform.OS === 'android') {
      // Check if running on emulator or physical device
      const { Constants } = require('expo-constants');
      if (Constants.isDevice) {
        return PHYSICAL_DEVICE_URL;
      } else {
        return ANDROID_EMULATOR_URL;
      }
    } else if (Platform.OS === 'ios') {
      return IOS_SIMULATOR_URL;
    } else {
      return 'http://localhost:3000/api/v1'; // Web
    }
  } else {
    // Production URL
    return 'https://your-production-api.com/api/v1';
  }
};

// Test QR tokens for development
export const TEST_QR_TOKENS = {
  TABLE_1: 'test-table-token-123',
  TABLE_2: 'test-table-token-456',
  TABLE_3: 'test-table-token-789',
};

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