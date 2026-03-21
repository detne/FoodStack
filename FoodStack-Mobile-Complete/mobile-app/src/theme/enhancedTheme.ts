export const enhancedTheme = {
  colors: {
    primary: '#E8622A',
    primaryLight: '#FF7A30',
    primaryDark: '#D44A1A',
    secondary: '#4FC3F7',
    success: '#2E7D32',
    warning: '#E65100',
    error: '#C62828',
    info: '#1565C0',
    
    // Backgrounds
    background: '#f5f5f0',
    surface: '#ffffff',
    surfaceLight: '#f8f8f8',
    
    // Text colors
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#888888',
    textLight: '#aaaaaa',
    
    // Status colors
    statusServed: '#E8F5E9',
    statusServedText: '#2E7D32',
    statusProcessing: '#FFF3E0',
    statusProcessingText: '#E65100',
    statusPaid: '#E3F2FD',
    statusPaidText: '#1565C0',
    statusCancelled: '#FFEBEE',
    statusCancelledText: '#C62828',
    statusPending: '#FFF9C4',
    statusPendingText: '#F57F17',
    
    // Gradients
    primaryGradient: ['#FF7A30', '#E8622A'],
    secondaryGradient: ['#4FC3F7', '#0288D1'],
    successGradient: ['#4DB6AC', '#00897B'],
    warningGradient: ['#CE93D8', '#7B1FA2'],
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
  },
  
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '900' as const,
      lineHeight: 32,
    },
    h2: {
      fontSize: 24,
      fontWeight: '900' as const,
      lineHeight: 28,
    },
    h3: {
      fontSize: 20,
      fontWeight: '900' as const,
      lineHeight: 24,
    },
    h4: {
      fontSize: 18,
      fontWeight: '800' as const,
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    body2: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    },
    small: {
      fontSize: 10,
      fontWeight: '700' as const,
      lineHeight: 14,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 12,
    },
  },
  
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};