/**
 * API Test Utilities
 * Helper functions to test API connectivity
 */

import { apiClient } from './api-client';

export async function testApiConnection() {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    console.log('🔍 Testing API connection to:', baseUrl);
    
    // Test basic connectivity
    const response = await fetch(baseUrl.replace('/api/v1', '/health'));
    const data = await response.json();
    
    console.log('✅ API Health Check:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    return { success: false, error };
  }
}

export async function testLogin(email: string, password: string) {
  try {
    console.log('🔐 Testing login with:', { email, password: '***' });
    
    const response = await apiClient.login(email, password);
    
    console.log('✅ Login Response:', {
      success: response.success,
      hasAccessToken: !!response.data?.accessToken,
      hasRefreshToken: !!response.data?.refreshToken,
      user: response.data?.user,
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Login Failed:', {
      message: error.message,
      errors: error.errors,
      status: error.status,
    });
    throw error;
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testApi = {
    testConnection: testApiConnection,
    testLogin,
    apiClient,
  };
  console.log('💡 API Test utilities available at: window.testApi');
}
