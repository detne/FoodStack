import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './api-config';
import { 
  ApiResponse, 
  TableInfo, 
  MenuData, 
  ItemCustomizations,
  OrderSession,
  OrderItem,
  Order,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AuthUser
} from '../types';

// API Configuration
const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL + '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          await AsyncStorage.setItem('access_token', accessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// Public API (no auth required)
export const publicApi = {
  // QR Code scanning
  scanQR: async (qrToken: string): Promise<ApiResponse<TableInfo>> => {
    const response = await apiClient.get(`/public/qr/${qrToken}`);
    return response.data;
  },

  // Get restaurants
  getRestaurants: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/restaurants');
    return response.data;
  },

  // Get restaurant details
  getRestaurant: async (restaurantId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Get menu for branch
  getMenu: async (branchId: string): Promise<ApiResponse<MenuData>> => {
    const response = await apiClient.get(`/branches/${branchId}/menu`);
    return response.data;
  },

  // Get menu item customizations
  getItemCustomizations: async (menuItemId: string): Promise<ApiResponse<ItemCustomizations>> => {
    const response = await apiClient.get(`/menu-items/${menuItemId}/customizations`);
    return response.data;
  },
};

// Order API
export const orderApi = {
  // Create session from QR
  createSession: async (qrToken: string): Promise<ApiResponse<OrderSession>> => {
    const response = await apiClient.post('/orders/session', { qrToken });
    return response.data;
  },

  // Create order
  createOrder: async (sessionToken: string, items: OrderItem[], notes?: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders', {
      sessionToken,
      items,
      notes,
    });
    return response.data;
  },

  // Get order status
  getOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order history
  getOrderHistory: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders/history');
    return response.data;
  },

  // Update order status (for restaurant)
  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

// Restaurant API
export const restaurantApi = {
  // Get my restaurants
  getMyRestaurants: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/restaurants/me');
    return response.data;
  },

  // Get restaurant statistics
  getMyStatistics: async (from?: string, to?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get(`/restaurants/me/statistics?${params.toString()}`);
    return response.data;
  },

  // Get restaurant details
  getRestaurant: async (restaurantId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Create restaurant
  createRestaurant: async (restaurantData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/restaurants', restaurantData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: string, restaurantData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  },
};

// Branch API
export const branchApi = {
  // Get branches
  getBranches: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/branches');
    return response.data;
  },

  // Get branch details
  getBranch: async (branchId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  },

  // Get branch menu
  getBranchMenu: async (branchId: string): Promise<ApiResponse<MenuData>> => {
    const response = await apiClient.get(`/branches/${branchId}/menu`);
    return response.data;
  },

  // Get branch tables
  getBranchTables: async (branchId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/branches/${branchId}/tables`);
    return response.data;
  },
};
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    await AsyncStorage.multiRemove(keys);
  },
};

export default apiClient;