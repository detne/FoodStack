/**
 * API Client for FoodStack Backend
 * Handles authentication, request/response interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface ApiError {
  success: false;
  message: string;
  errors?: any[];
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Always try to load token from localStorage on init
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    // Always get fresh token from localStorage
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Always get fresh token before making request
    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, clear token
        if (response.status === 401) {
          console.error('401 Unauthorized - clearing tokens');
          this.setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('refresh_token');
        }
        throw data;
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', {
        endpoint,
        error: error.message || error,
        status: error.status,
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ 
      accessToken?: string; 
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      user: any 
    }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  }

  async register(data: {
    full_name: string;
    email: string;
    password: string;
    restaurant_name: string;
    phone?: string;
  }) {
    return this.request<{ user: any; restaurant: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async verifyEmailOtp(email: string, otp: string) {
    return this.request('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Restaurant endpoints
  async getRestaurant(id: string) {
    return this.request(`/restaurants/${id}`);
  }

  async createRestaurant(data: any) {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: string, data: any) {
    return this.request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Branch endpoints
  async getBranches(restaurantId?: string) {
    const query = restaurantId ? `?restaurant_id=${restaurantId}` : '';
    return this.request(`/branches${query}`);
  }

  async getBranch(id: string) {
    return this.request(`/branches/${id}`);
  }

  async createBranch(data: any) {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBranch(id: string, data: any) {
    return this.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(id: string) {
    return this.request(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // Category endpoints
  async getCategories(branchId?: string) {
    const query = branchId ? `?branch_id=${branchId}` : '';
    return this.request(`/categories${query}`);
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu Item endpoints
  async getMenuItems(categoryId?: string) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request(`/menu-items${query}`);
  }

  async getMenuItem(id: string) {
    return this.request(`/menu-items/${id}`);
  }

  async createMenuItem(data: any) {
    return this.request('/menu-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu-items/${id}`, {
      method: 'DELETE',
    });
  }

  // Public endpoints
  async getTableByQR(qrToken: string) {
    return this.request(`/public/tables/${qrToken}`);
  }

  async getPublicMenu(branchId: string) {
    return this.request(`/public/branches/${branchId}/menu`);
  }

  async getItemCustomizations(itemId: string) {
    return this.request(`/public/menu-items/${itemId}/customizations`);
  }

  // Customer Order endpoints
  async createOrderSession(qrToken: string, customerCount: number = 1) {
    return this.request('/customer-orders/sessions', {
      method: 'POST',
      body: JSON.stringify({ qr_token: qrToken, customer_count: customerCount }),
    });
  }

  async createOrder(sessionToken: string, items: any[], notes?: string) {
    return this.request('/customer-orders', {
      method: 'POST',
      body: JSON.stringify({ session_token: sessionToken, items, notes }),
    });
  }

  async getOrderStatus(orderId: string, sessionToken: string) {
    return this.request(`/customer-orders/${orderId}?session_token=${sessionToken}`);
  }

  async addOrderItems(orderId: string, sessionToken: string, items: any[]) {
    return this.request(`/customer-orders/${orderId}/items`, {
      method: 'PUT',
      body: JSON.stringify({ session_token: sessionToken, items }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, ApiError };
