import { getApiBaseUrl } from './api-config';
import { publicApi, orderApi, authApi } from './api';

// Service để test kết nối API
export const testService = {
  // Test kết nối cơ bản với timeout ngắn
  testConnection: async (): Promise<{ success: boolean; message: string; baseUrl: string }> => {
    try {
      const baseUrl = getApiBaseUrl();
      console.log('Testing connection to:', baseUrl);
      
      // Test với timeout ngắn
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return {
          success: true,
          message: 'Kết nối API thành công!',
          baseUrl
        };
      } else {
        return {
          success: false,
          message: `Lỗi kết nối: ${response.status} - ${response.statusText}`,
          baseUrl
        };
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      let message = `Lỗi kết nối: ${error.message}`;
      
      if (error.name === 'AbortError') {
        message = 'Kết nối quá chậm (timeout 5s)';
      } else if (error.message.includes('Network')) {
        message = 'Lỗi mạng - Kiểm tra IP trong config.js';
      }
      
      return {
        success: false,
        message,
        baseUrl: getApiBaseUrl()
      };
    }
  },

  // Test QR token (sử dụng token test)
  testQRToken: async (qrToken: string = 'test-table-token-123') => {
    try {
      console.log('Testing QR token:', qrToken);
      const tableInfo = await publicApi.getTableByQR(qrToken);
      return {
        success: true,
        message: 'QR token hợp lệ!',
        data: tableInfo
      };
    } catch (error: any) {
      console.error('QR test failed:', error);
      return {
        success: false,
        message: `Lỗi QR: ${error.message}`,
        data: null
      };
    }
  },

  // Test lấy menu
  testGetMenu: async (branchId: string = 'branch-1') => {
    try {
      console.log('Testing get menu for branch:', branchId);
      const menuData = await publicApi.getMenu(branchId);
      return {
        success: true,
        message: 'Lấy menu thành công!',
        data: menuData
      };
    } catch (error: any) {
      console.error('Menu test failed:', error);
      return {
        success: false,
        message: `Lỗi menu: ${error.message}`,
        data: null
      };
    }
  },

  // Test tạo session
  testCreateSession: async (qrToken: string = 'test-table-token-123') => {
    try {
      console.log('Testing create session with QR:', qrToken);
      const session = await orderApi.createSession(qrToken, 2);
      return {
        success: true,
        message: 'Tạo session thành công!',
        data: session
      };
    } catch (error: any) {
      console.error('Session test failed:', error);
      return {
        success: false,
        message: `Lỗi session: ${error.message}`,
        data: null
      };
    }
  },

  // Test tạo order
  testCreateOrder: async (sessionToken: string, testItems: any[]) => {
    try {
      console.log('Testing create order with session:', sessionToken);
      const order = await orderApi.createOrder(sessionToken, testItems, 'Test order từ mobile app');
      return {
        success: true,
        message: 'Tạo order thành công!',
        data: order
      };
    } catch (error: any) {
      console.error('Order test failed:', error);
      return {
        success: false,
        message: `Lỗi order: ${error.message}`,
        data: null
      };
    }
  },

  // Test login
  testLogin: async (email: string = 'test@example.com', password: string = 'password123') => {
    try {
      console.log('Testing login with:', email);
      const authResponse = await authApi.login({ email, password });
      return {
        success: true,
        message: 'Đăng nhập thành công!',
        data: authResponse
      };
    } catch (error: any) {
      console.error('Login test failed:', error);
      return {
        success: false,
        message: `Lỗi đăng nhập: ${error.message}`,
        data: null
      };
    }
  },

  // Test get user info
  testGetMe: async () => {
    try {
      console.log('Testing get current user');
      const user = await authApi.getMe();
      return {
        success: true,
        message: 'Lấy thông tin user thành công!',
        data: user
      };
    } catch (error: any) {
      console.error('Get me test failed:', error);
      return {
        success: false,
        message: `Lỗi lấy thông tin user: ${error.message}`,
        data: null
      };
    }
  }
};

// Mock data để test
export const mockTestData = {
  testOrderItems: [
    {
      menu_item_id: 'item-1',
      quantity: 2,
      notes: 'Không cay',
      customizations: []
    },
    {
      menu_item_id: 'item-2', 
      quantity: 1,
      notes: 'Thêm đá',
      customizations: []
    }
  ]
};