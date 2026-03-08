import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  gradientColors?: string[];
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  gradient = false,
  gradientColors,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    } else {
      baseStyle.push(styles[variant]);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    } else {
      baseStyle.push(styles[`${variant}Text`]);
    }
    
    return [...baseStyle, textStyle];
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const ButtonContent = () => (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <Text style={[getTextStyle(), { marginRight: theme.spacing.sm }]}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  if (gradient && (variant === 'primary' || variant === 'secondary')) {
    const colors = gradientColors || 
      (variant === 'primary' ? theme.gradients.primary : theme.gradients.secondary);
    
    return (
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        direction="alternate"
        duration={2000}
        style={[getButtonStyle(), { padding: 0 }]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[size]]}
        >
          <TouchableOpacity
            style={styles.gradientButton}
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={disabled || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <>
                {icon && <Text style={[styles.gradientText, { marginRight: theme.spacing.sm }]}>{icon}</Text>}
                <Text style={styles.gradientText}>{title}</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animatable.View>
    );
  }

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={theme.animation.duration.normal}
    >
      <ButtonContent />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  
  // Sizes
  sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.dimensions.buttonHeight,
  },
  lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Disabled
  disabled: {
    backgroundColor: theme.colors.gray300,
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  
  // Text sizes
  smText: {
    fontSize: theme.fontSize.sm,
  },
  mdText: {
    fontSize: theme.fontSize.base,
  },
  lgText: {
    fontSize: theme.fontSize.lg,
  },
  
  // Text variants
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.gray500,
  },
  
  // Gradient styles
  gradient: {
    borderRadius: theme.borderRadius.md,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.base,
  },
});

export default AnimatedButton;