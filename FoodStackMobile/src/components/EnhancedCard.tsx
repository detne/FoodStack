import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EnhancedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
  shadow?: boolean;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  style,
  gradient = false,
  gradientColors = ['#FF7A30', '#E8622A'],
  shadow = true,
}) => {
  const cardStyle = [
    styles.card,
    shadow && styles.shadow,
    style,
  ];

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={cardStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
  },
  
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
});

export default EnhancedCard;