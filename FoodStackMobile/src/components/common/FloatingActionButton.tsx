import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  gradient?: boolean;
  gradientColors?: string[];
  style?: ViewStyle;
  badge?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  position = 'bottom-right',
  gradient = true,
  gradientColors = theme.gradients.primary,
  style,
  badge,
}) => {
  const getPositionStyle = () => {
    const basePosition = {
      position: 'absolute' as const,
      bottom: theme.spacing.xl,
    };

    switch (position) {
      case 'bottom-right':
        return { ...basePosition, right: theme.spacing.lg };
      case 'bottom-left':
        return { ...basePosition, left: theme.spacing.lg };
      case 'bottom-center':
        return { ...basePosition, alignSelf: 'center' as const };
      default:
        return { ...basePosition, right: theme.spacing.lg };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'md':
        return { width: 56, height: 56, borderRadius: 28 };
      case 'lg':
        return { width: 64, height: 64, borderRadius: 32 };
      default:
        return { width: 56, height: 56, borderRadius: 28 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return theme.fontSize.lg;
      case 'md':
        return theme.fontSize.xl;
      case 'lg':
        return theme.fontSize['2xl'];
      default:
        return theme.fontSize.xl;
    }
  };

  const fabStyle = [
    styles.fab,
    getSizeStyle(),
    getPositionStyle(),
    style,
  ];

  const FabContent = () => (
    <TouchableOpacity
      style={fabStyle}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, { fontSize: getIconSize() }]}>{icon}</Text>
      {badge && badge > 0 && (
        <Animatable.View
          animation="bounceIn"
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge.toString()}
          </Text>
        </Animatable.View>
      )}
    </TouchableOpacity>
  );

  const GradientFab = () => (
    <Animatable.View
      animation="bounceIn"
      duration={600}
      style={[getSizeStyle(), getPositionStyle(), style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientFab, getSizeStyle()]}
      >
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.icon, { fontSize: getIconSize() }]}>{icon}</Text>
        </TouchableOpacity>
      </LinearGradient>
      {badge && badge > 0 && (
        <Animatable.View
          animation="bounceIn"
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge.toString()}
          </Text>
        </Animatable.View>
      )}
    </Animatable.View>
  );

  if (gradient) {
    return <GradientFab />;
  }

  return (
    <Animatable.View
      animation="bounceIn"
      duration={600}
    >
      <FabContent />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    zIndex: 1000,
  },
  
  gradientFab: {
    ...theme.shadows.lg,
    zIndex: 1000,
  },
  
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  icon: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
});

export default FloatingActionButton;