import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary colors
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    
    // Secondary colors
    secondary: '#f59e0b',
    secondaryLight: '#fbbf24',
    secondaryDark: '#d97706',
    
    // Success colors
    success: '#10b981',
    successLight: '#34d399',
    successDark: '#059669',
    
    // Error colors
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    
    // Warning colors
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    
    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Background colors
    background: '#f9fafb',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
  },
  
  gradients: {
    primary: ['#6366f1', '#8b5cf6'],
    secondary: ['#f59e0b', '#f97316'],
    success: ['#10b981', '#059669'],
    sunset: ['#f97316', '#f59e0b', '#eab308'],
    ocean: ['#0ea5e9', '#06b6d4', '#10b981'],
    purple: ['#8b5cf6', '#a855f7', '#c084fc'],
    pink: ['#ec4899', '#f472b6', '#fb7185'],
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  dimensions: {
    screenWidth: width,
    screenHeight: height,
    headerHeight: 60,
    tabBarHeight: 80,
    buttonHeight: 48,
    inputHeight: 48,
  },
  
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      linear: 'linear',
    },
  },
};

export type Theme = typeof theme;