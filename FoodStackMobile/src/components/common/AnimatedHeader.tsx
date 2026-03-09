import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  gradient?: boolean;
  gradientColors?: string[];
  transparent?: boolean;
  showStatusBar?: boolean;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  gradient = false,
  gradientColors = theme.gradients.primary,
  transparent = false,
  showStatusBar = true,
}) => {
  const HeaderContent = () => (
    <View style={[styles.header, transparent && styles.transparent]}>
      {showStatusBar && (
        <StatusBar
          barStyle={gradient || !transparent ? 'light-content' : 'dark-content'}
          backgroundColor={gradient ? gradientColors[0] : transparent ? 'transparent' : theme.colors.primary}
          translucent={transparent}
        />
      )}
      
      <View style={styles.headerContent}>
        {/* Left Icon */}
        {leftIcon && (
          <Animatable.View animation="slideInLeft" duration={300}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, gradient && styles.gradientIcon]}>{leftIcon}</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
        
        {/* Title & Subtitle */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={400}
          delay={100}
          style={styles.titleContainer}
        >
          <Text style={[styles.title, gradient && styles.gradientTitle]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, gradient && styles.gradientSubtitle]}>{subtitle}</Text>
          )}
        </Animatable.View>
        
        {/* Right Icon */}
        {rightIcon && (
          <Animatable.View animation="slideInRight" duration={300}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, gradient && styles.gradientIcon]}>{rightIcon}</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <HeaderContent />
      </LinearGradient>
    );
  }

  return <HeaderContent />;
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  gradientHeader: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    minHeight: theme.dimensions.headerHeight,
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  icon: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
  },
  
  gradientTitle: {
    color: theme.colors.white,
  },
  
  gradientSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  
  gradientIcon: {
    color: theme.colors.white,
  },
});

export default AnimatedHeader;