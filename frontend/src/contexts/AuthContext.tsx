/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  fullName: string;
  full_name?: string; // For backward compatibility
  role: string;
  restaurantId?: string;
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

  useEffect(() => {
    // Check if user is already logged in
    const token = apiClient.getToken();
    if (token) {
      // Try to restore user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { accessToken, access_token, refreshToken, refresh_token, user: userData } = response.data;
        
        // Handle both accessToken and access_token formats
        const token = accessToken || access_token;
        const refreshTokenValue = refreshToken || refresh_token;
        
        if (!token) {
          throw new Error('No access token received from server');
        }
        
        // Normalize user data
        const normalizedUser: User = {
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          full_name: userData.fullName, // For backward compatibility
          role: userData.role,
          restaurantId: userData.restaurantId,
          restaurant: userData.restaurant,
        };
        
        apiClient.setToken(token);
        console.log('Token set in apiClient:', token ? 'Success' : 'Failed');
        
        if (refreshTokenValue) {
          localStorage.setItem('refresh_token', refreshTokenValue);
        }
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        console.log('User saved to localStorage:', normalizedUser);
        
        setUser(normalizedUser);
        
        return normalizedUser;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const register = async (data: any) => {
    try {
      const response = await apiClient.register(data);
      if (response.success && response.data) {
        // Auto login after registration
        setUser(response.data.user);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
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
