import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  gradientColors?: string[];
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  gradient = true,
  gradientColors = ['#FF7A30', '#E8622A'],
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = [
    styles.button,
    style,
    disabled && styles.disabled,
  ];

  const content = (
    <Text style={[styles.buttonText, textStyle, disabled && styles.disabledText]}>
      {title}
    </Text>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {gradient && !disabled ? (
          <LinearGradient
            colors={gradientColors}
            style={buttonStyle}
          >
            {content}
          </LinearGradient>
        ) : (
          <Animated.View style={buttonStyle}>
            {content}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8622A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  disabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },

  disabledText: {
    color: '#888',
  },
});

export default AnimatedButton;