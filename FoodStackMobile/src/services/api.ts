import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ApiResponse, 
  TableInfo, 
  MenuData, 
  ItemCustomizations,
  OrderSession,
  OrderItem,
  Order 
} from '../types';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api/v1'  // Android emulator
  : 'https://your-production-api.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for session token
api.interceptors.request.use(async (config) => {
  const sessionToken = await AsyncStorage.getItem('session_token');
  if (sessionToken && config.url?.includes('customer-orders')) {
    config.params = { ...config.params, session_token: sessionToken };
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Public API calls (no auth required)
export const publicApi = {
  // Get table info by QR token
  getTableByQR: async (qrToken: string): Promise<TableInfo> => {
    const response = await api.get<ApiResponse<TableInfo>>(`/public/tables/${qrToken}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get table info');
    }
    return response.data.data;
  },

  // Get menu for branch
  getMenu: async (branchId: string): Promise<MenuData> => {
    const response = await api.get<ApiResponse<MenuData>>(`/public/branches/${branchId}/menu`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu');
    }
    return response.data.data;
  },

  // Get customizations for menu item
  getItemCustomizations: async (itemId: string): Promise<ItemCustomizations> => {
    const response = await api.get<ApiResponse<ItemCustomizations>>(`/public/menu-items/${itemId}/customizations`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get customizations');
    }
    return response.data.data;
  },
};

// Customer order API calls (session-based)
export const orderApi = {
  // Create order session
  createSession: async (qrToken: string, customerCount: number = 1): Promise<OrderSession> => {
    const response = await api.post<ApiResponse<OrderSession>>('/customer-orders/sessions', {
      qr_token: qrToken,
      customer_count: customerCount,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create session');
    }
    
    // Store session token
    await AsyncStorage.setItem('session_token', response.data.data.session_token);
    
    return response.data.data;
  },

  // Create order
  createOrder: async (sessionToken: string, items: OrderItem[], notes?: string): Promise<{ order_id: string; status: string; total_amount: number; created_at: string }> => {
    const response = await api.post<ApiResponse<{ order_id: string; status: string; total_amount: number; created_at: string }>>('/customer-orders', {
      session_token: sessionToken,
      items,
      notes,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create order');
    }
    return response.data.data;
  },

  // Get order status
  getOrderStatus: async (orderId: string, sessionToken: string): Promise<{ order: Order }> => {
    const response = await api.get<ApiResponse<{ order: Order }>>(`/customer-orders/${orderId}`, {
      params: { session_token: sessionToken }
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get order status');
    }
    return response.data.data;
  },

  // Add items to existing order
  addOrderItems: async (orderId: string, sessionToken: string, items: OrderItem[]): Promise<{ additional_amount: number }> => {
    const response = await api.put<ApiResponse<{ additional_amount: number }>>(`/customer-orders/${orderId}/items`, {
      session_token: sessionToken,
      items,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to add items');
    }
    return response.data.data;
  },
};

// Storage utilities
export const storage = {
  getSessionToken: () => AsyncStorage.getItem('session_token'),
  setSessionToken: (token: string) => AsyncStorage.setItem('session_token', token),
  clearSession: () => AsyncStorage.removeItem('session_token'),
  
  getTableInfo: async (): Promise<TableInfo | null> => {
    const data = await AsyncStorage.getItem('table_info');
    return data ? JSON.parse(data) : null;
  },
  setTableInfo: (tableInfo: TableInfo) => AsyncStorage.setItem('table_info', JSON.stringify(tableInfo)),
  clearTableInfo: () => AsyncStorage.removeItem('table_info'),
};

export default api;