/**
 * Authentication Context
 * Manages user authentication state and provides auth methods.
 * Wires up apiClient's force-logout callback so token refresh failures
 * automatically clear the session and redirect to login.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  fullName: string;
  full_name?: string;
  role: string;
  restaurantId?: string;
  branchId?: string;
  restaurant?: {
    id: string;
    name: string;
    email_verified: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ── Shared logout logic (also called by apiClient on refresh failure) ──
  const clearSession = useCallback(async (callApi = false) => {
    if (callApi) {
      try { await apiClient.logout(); } catch { /* ignore */ }
    }
    apiClient.setToken(null);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Wire up the force-logout callback once on mount
  useEffect(() => {
    apiClient.setForceLogoutCallback(() => {
      clearSession(false);
      navigate('/login', { replace: true });
    });
  }, [clearSession, navigate]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // corrupted — clear it
          localStorage.removeItem('user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);

    if (response.success && response.data) {
      const { accessToken, access_token, refreshToken, refresh_token, user: userData } = response.data;

      const token = accessToken || access_token;
      const refreshTokenValue = refreshToken || refresh_token;

      if (!token) throw new Error('No access token received from server');

      const normalizedUser: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        full_name: userData.fullName,
        role: userData.role,
        restaurantId: userData.restaurantId,
        branchId: userData.branchId,
        restaurant: userData.restaurant,
      };

      apiClient.setToken(token);

      if (refreshTokenValue) {
        localStorage.setItem('refresh_token', refreshTokenValue);
      }
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      if (userData.branchId) {
        localStorage.setItem('selected_branch_id', userData.branchId);
      }

      setUser(normalizedUser);
      return normalizedUser;
    }
  };

  const logout = async () => {
    await clearSession(true);
    navigate('/login', { replace: true });
  };

  const register = async (data: any) => {
    const response = await apiClient.register(data);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
