import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#000' }) => {
  // Temporary emoji-based icons until react-native-svg is properly configured
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      // Navigation icons
      home: '🏠',
      orders: '📋',
      offers: '🏷️',
      profile: '👤',
      back: '←',
      
      // Action icons
      bell: '🔔',
      qr: '📱',
      menu: '☰',
      history: '🕐',
      tag: '🏷️',
      reorder: '🔄',
      receipt: '🧾',
      track: '⏱️',
      
      // Auth icons
      mail: '✉️',
      lock: '🔒',
      user: '👤',
      eye: '👁️',
      'eye-off': '🙈',
      phone: '📞',
      info: 'ℹ️',
      home: '🏠',
      map: '📍',
      
      // Default
      default: '●',
    };
    
    return iconMap[iconName] || iconMap.default;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.icon, { fontSize: size * 0.8, color }]}>
        {getIcon(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default Icon;