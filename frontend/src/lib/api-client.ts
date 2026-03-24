/**
 * API Client for FoodStack Backend
 * Handles authentication, token refresh with retry, and request queuing.
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

  // Refresh state — prevents concurrent refresh storms
  private isRefreshing = false;
  private refreshQueue: Array<(token: string | null) => void> = [];

  // Callback set by AuthContext so the client can trigger a full logout
  private onForceLogout: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  /** Called once by AuthProvider to wire up forced-logout on refresh failure */
  setForceLogoutCallback(cb: () => void) {
    this.onForceLogout = cb;
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
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  // ─── Token Refresh ────────────────────────────────────────────────────────

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * All concurrent callers queue here and receive the same result.
   */
  private async attemptRefresh(): Promise<string | null> {
    // If already refreshing, queue and wait
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      // DTO expects { refreshToken } (camelCase) — confirmed from src/dto/auth/refresh-token.js
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();

      if (!data.success || !data.data?.accessToken) throw new Error('Invalid refresh response');

      const newAccessToken: string = data.data.accessToken;
      const newRefreshToken: string | undefined = data.data.refreshToken;

      // Persist new tokens (backend does rotation — always save new refresh token)
      this.setToken(newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      // Resolve all queued requests with the new token
      this.refreshQueue.forEach((resolve) => resolve(newAccessToken));
      this.refreshQueue = [];

      return newAccessToken;
    } catch (err) {
      // Refresh failed — flush queue with null and force logout
      this.refreshQueue.forEach((resolve) => resolve(null));
      this.refreshQueue = [];

      this.clearSession();
      this.onForceLogout?.();

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /** Wipe all auth data from memory and storage */
  private clearSession() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // ─── Core Request ─────────────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // ── Happy path ──
    if (response.ok) {
      return response.json() as Promise<ApiResponse<T>>;
    }

    // ── 401 handling ──
    if (response.status === 401 && !_isRetry) {
      const newToken = await this.attemptRefresh();

      if (newToken) {
        // Retry original request once with the new token
        return this.request<T>(endpoint, options, true);
      }

      // Refresh failed — session already cleared, throw to caller
      throw { success: false, message: 'Session expired. Please log in again.', status: 401 };
    }

    // ── Other errors ──
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { success: false, message: response.statusText };
    }
    throw errorBody;
  }

  // Convenience methods for cleaner API calls
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ─── Auth endpoints ───────────────────────────────────────────────────────

  async login(email: string, password: string) {
    return this.request<{
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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

  // ─── Restaurant endpoints ─────────────────────────────────────────────────

  async getRestaurant(id: string) {
    return this.request(`/restaurants/${id}`);
  }

  async getUserRestaurants() {
    return this.request('/restaurants/my-restaurants');
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

  // ─── Branch endpoints ─────────────────────────────────────────────────────

  async getBranches(restaurantId?: string) {
    let finalRestaurantId = restaurantId;

    if (!finalRestaurantId) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          finalRestaurantId = JSON.parse(userData)?.restaurant?.id;
        }
      } catch {
        // ignore
      }
    }

    if (!finalRestaurantId) throw new Error('Restaurant ID is required');

    return this.request(`/branches?restaurantId=${finalRestaurantId}`);
  }

  async getBranch(id: string) {
    return this.request(`/branches/${id}`);
  }

  async getBranchStatistics(branchId: string, params?: { from_date?: string; to_date?: string }) {
    const query = new URLSearchParams();
    if (params?.from_date) query.append('from_date', params.from_date);
    if (params?.to_date) query.append('to_date', params.to_date);
    const qs = query.toString();
    return this.request(`/branches/${branchId}/statistics${qs ? `?${qs}` : ''}`);
  }

  async createBranch(data: any) {
    return this.request('/branches', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateBranch(id: string, data: any) {
    return this.request(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteBranch(id: string) {
    return this.request(`/branches/${id}`, { method: 'DELETE' });
  }

  // ─── Category endpoints ───────────────────────────────────────────────────

  async getCategories(branchId?: string) {
    const query = branchId ? `?branch_id=${branchId}` : '';
    return this.request(`/categories${query}`);
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // ─── Menu Item endpoints ──────────────────────────────────────────────────

  async getMenuItems(categoryId?: string) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request(`/menu-items${query}`);
  }

  async getMenuItem(id: string) {
    return this.request(`/menu-items/${id}`);
  }

  async createMenuItem(data: any) {
    return this.request('/menu-items', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu-items/${id}`, { method: 'DELETE' });
  }

  async uploadMenuItemImage(menuItemId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const doUpload = async (token: string | null) => {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/menu-items/${menuItemId}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return { response, data: await response.json() };
    };

    let { response, data } = await doUpload(this.getToken());

    if (response.status === 401) {
      const newToken = await this.attemptRefresh();
      if (!newToken) throw { success: false, message: 'Session expired. Please log in again.' };
      ({ response, data } = await doUpload(newToken));
    }

    if (!response.ok) throw data;
    return data;
  }

  async updateMenuItemAvailability(menuItemId: string, available: boolean) {
    return this.request(`/menu-items/${menuItemId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  }

  async importMenuItems(rows: Array<Record<string, any>>) {
    return this.request<{
      total: number;
      succeeded: number;
      failed: number;
      errors: Array<{ row: number; message: string }>;
      items: any[];
    }>('/menu-items/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  }

  async getPaymentStatistics(params: {
    restaurantId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params.restaurantId) query.append('restaurantId', params.restaurantId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return this.request<{
      restaurant: { id: string; name: string };
      filters: { startDate: string | null; endDate: string | null };
      totalRevenue: number;
      transactionCount: number;
    }>(`/payments/statistics${qs ? `?${qs}` : ''}`);
  }

  async updateBranchAvailability(menuItemId: string, available: boolean, reason?: string) {
    return this.request(`/menu-items/${menuItemId}/branch-availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available, reason }),
    });
  }

  // ─── Public endpoints ─────────────────────────────────────────────────────

  async getTableByQR(qrToken: string) {
    return this.request(`/public/tables/${qrToken}`);
  }

  async getPublicMenu(branchId: string) {
    return this.request(`/public/branches/${branchId}/menu`);
  }

  async getItemCustomizations(itemId: string) {
    return this.request(`/public/menu-items/${itemId}/customizations`);
  }

  // ─── Customer Order endpoints ─────────────────────────────────────────────

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

  // ─── Table endpoints ──────────────────────────────────────────────────────

  async getTablesByBranch(branchId: string) {
    return this.request(`/branches/${branchId}/tables`);
  }

  async updateTableStatus(tableId: string, status: string) {
    return this.request(`/tables/${tableId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ─── Reservation endpoints ────────────────────────────────────────────────

  async getReservations(params?: { branchId?: string; status?: string; date?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString();
    return this.request(`/reservations${qs ? `?${qs}` : ''}`);
  }

  async getReservationDetails(id: string) {
    return this.request(`/reservations/${id}`);
  }

  async createReservation(data: any) {
    return this.request('/reservations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateReservation(id: string, data: any) {
    return this.request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async cancelReservation(id: string) {
    return this.request(`/reservations/${id}/cancel`, { method: 'POST' });
  }

  async confirmReservation(id: string) {
    return this.request(`/reservations/${id}/confirm`, { method: 'POST' });
  }

  async completeReservation(id: string) {
    return this.request(`/reservations/${id}/complete`, { method: 'POST' });
  }

  async assignTableToReservation(id: string, tableId: string) {
    return this.request(`/reservations/${id}/assign-table`, {
      method: 'PATCH',
      body: JSON.stringify({ tableId }),
    });
  }

  async checkTableAvailability(params: { branchId: string; reservationDate: string; reservationTime: string; partySize: number }) {
    const query = new URLSearchParams({
      branchId: params.branchId,
      reservationDate: params.reservationDate,
      reservationTime: params.reservationTime,
      partySize: params.partySize.toString(),
    });
    return this.request(`/reservations/check-availability?${query.toString()}`);
  }

  // ─── Order endpoints (Staff) ──────────────────────────────────────────────

  async getOrderDetails(orderId: string) {
    return this.request<any>(`/orders/${orderId}`);
  }

  async getOrdersByBranch(
    branchId: string,
    options?: { roundStatus?: string; page?: number; limit?: number }
  ) {
    const query = new URLSearchParams();
    if (options?.roundStatus && options.roundStatus !== 'all')
      query.append('roundStatus', options.roundStatus.toUpperCase());
    if (options?.page) query.append('page', options.page.toString());
    if (options?.limit) query.append('limit', options.limit.toString());
    const qs = query.toString();
    return this.request<{
      orders: any[];
      pagination: { page: number; limit: number; total: number; total_pages: number };
      branch: { id: string; name: string };
    }>(`/orders/branch/${branchId}/active${qs ? `?${qs}` : ''}`);
  }

  async getCompletedOrdersByBranch(branchId: string, options?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (options?.page) query.append('page', options.page.toString());
    if (options?.limit) query.append('limit', options.limit.toString());
    const qs = query.toString();
    return this.request<{
      orders: any[];
      pagination: { page: number; limit: number; total: number; total_pages: number };
      branch: { id: string; name: string };
    }>(`/orders/branch/${branchId}/completed${qs ? `?${qs}` : ''}`);
  }

  async getCheckoutPreview(orderId: string, qrToken: string) {
    return this.request<any>(`/payments/checkout-preview?orderId=${orderId}&qrToken=${qrToken}`);
  }

  async processPayment(data: { orderId: string; qrToken: string; method: 'CASH' | 'QR_PAY' }) {
    return this.request<any>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmCashPayment(paymentId: string) {
    return this.request<any>(`/payments/${paymentId}/confirm-cash`, { method: 'POST' });
  }

  async updateRoundStatus(orderId: string, roundId: string, status: string) {
    return this.request(`/orders/${orderId}/rounds/${roundId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async markItemServed(orderId: string, roundId: string, itemId: string) {
    return this.request(`/orders/${orderId}/rounds/${roundId}/items/${itemId}/served`, {
      method: 'PUT',
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ─── Organised helpers ────────────────────────────────────────────────────

  reservations = {
    list: (branchId: string) => this.request(`/reservations?branchId=${branchId}`),
    create: (branchId: string, data: any) =>
      this.request('/reservations', { method: 'POST', body: JSON.stringify({ ...data, branch_id: branchId }) }),
    updateStatus: (_branchId: string, id: string, status: string) =>
      this.request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    assignTable: (_branchId: string, id: string, tableId: string) =>
      this.request(`/reservations/${id}/assign-table`, { method: 'PATCH', body: JSON.stringify({ tableId }) }),
    complete: (_branchId: string, id: string) =>
      this.request(`/reservations/${id}/complete`, { method: 'POST' }),
    confirm: (_branchId: string, id: string) =>
      this.request(`/reservations/${id}/confirm`, { method: 'POST' }),
    cancel: (_branchId: string, id: string) =>
      this.request(`/reservations/${id}/cancel`, { method: 'POST' }),
  };

  tables = {
    list: (branchId: string) => this.request(`/branches/${branchId}/tables`),
    updateStatus: (_branchId: string, id: string, status: string) =>
      this.request(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, ApiError };
