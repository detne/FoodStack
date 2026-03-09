import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  borderRadius?: keyof typeof theme.borderRadius;
  animated?: boolean;
  animationType?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn';
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
  margin,
  borderRadius = 'md',
  animated = true,
  animationType = 'fadeIn',
  delay = 0,
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    {
      padding: theme.spacing[padding],
      borderRadius: theme.borderRadius[borderRadius],
    },
    margin && { margin: theme.spacing[margin] },
    style,
  ];

  const CardContent = () => (
    <View style={cardStyle}>
      {children}
    </View>
  );

  const TouchableCard = () => (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {children}
    </TouchableOpacity>
  );

  const CardComponent = onPress ? TouchableCard : CardContent;

  if (animated) {
    return (
      <Animatable.View
        animation={animationType}
        duration={theme.animation.duration.normal}
        delay={delay}
      >
        <CardComponent />
      </Animatable.View>
    );
  }

  return <CardComponent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  
  default: {
    ...theme.shadows.sm,
  },
  
  elevated: {
    ...theme.shadows.lg,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  
  filled: {
    backgroundColor: theme.colors.surfaceVariant,
  },
});

export default Card;