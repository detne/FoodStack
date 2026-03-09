import storage from './storageService';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ForgotPasswordRequest,
  VerifyEmailOtpRequest,
  ApiResponse 
} from '../types';

const API_BASE_URL = 'http://192.168.5.120:3000/api/v1'; // Updated to match your backend

class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Storage keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  // API Methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        // Store tokens and user data
        await this.storeAuthData(data.data);
        return data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async registerRestaurant(userData: {
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    ownerPhone: string;
    restaurantName: string;
    businessType: 'RESTAURANT' | 'CAFE' | 'BAR' | 'FAST_FOOD';
    address: string;
    taxCode?: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Restaurant registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Restaurant registration failed');
      }
    } catch (error) {
      console.error('Restaurant registration error:', error);
      throw error;
    }
  }

  async registerCustomer(userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<void> {
    try {
      // TODO: Implement customer registration API when backend is ready
      // For now, throw an error to inform user
      throw new Error('Đăng ký khách hàng chưa được hỗ trợ. Vui lòng liên hệ admin.');
      
      const response = await fetch(`${API_BASE_URL}/auth/register-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Customer registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Customer registration failed');
      }
    } catch (error) {
      console.error('Customer registration error:', error);
      throw error;
    }
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async verifyEmailOtp(request: VerifyEmailOtpRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      if (data.success && data.data) {
        await this.storeAuthData(data.data);
        return data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear stored data if refresh fails
      await this.clearAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // TODO: Call logout API if needed
      await this.clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear data even if API call fails
      await this.clearAuthData();
    }
  }

  // Storage Methods
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await storage.multiSet([
        [this.ACCESS_TOKEN_KEY, authData.accessToken],
        [this.REFRESH_TOKEN_KEY, authData.refreshToken],
        [this.USER_DATA_KEY, JSON.stringify(authData.user)],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await storage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await storage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async getUserData(): Promise<any | null> {
    try {
      const userData = await storage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      return !!accessToken;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await storage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.USER_DATA_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // HTTP Interceptor for authenticated requests
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      let accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Add authorization header
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If token expired, try to refresh
      if (response.status === 401) {
        try {
          const newAuthData = await this.refreshToken();
          accessToken = newAuthData.accessToken;

          // Retry request with new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (refreshError) {
          // Refresh failed, redirect to login
          throw new Error('Authentication expired');
        }
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }
}

export default AuthService.getInstance();