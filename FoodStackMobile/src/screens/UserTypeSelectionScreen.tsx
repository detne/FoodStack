import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type UserTypeSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserTypeSelection'>;

interface Props {
  navigation: UserTypeSelectionScreenNavigationProp;
}

const UserTypeSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUserTypeSelection = (userType: 'customer' | 'partner') => {
    navigation.navigate('Register', { userType });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FoodStack</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Join FoodStack</Text>
        <Text style={styles.subtitle}>Choose your account type to get started</Text>

        {/* Customer Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleUserTypeSelection('customer')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🍴</Text>
          </View>
          <Text style={styles.optionTitle}>Customer</Text>
          <Text style={styles.optionDescription}>Order food delivery</Text>
        </TouchableOpacity>

        {/* Partner Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleUserTypeSelection('partner')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🏪</Text>
          </View>
          <Text style={styles.optionTitle}>Partner</Text>
          <Text style={styles.optionDescription}>Grow your business</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Login Link */}
      <Animated.View
        style={[
          styles.loginContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 24,
    color: '#333',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  placeholder: {
    width: 40,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 22,
  },

  // Option Card Styles
  optionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  iconText: {
    fontSize: 32,
  },

  optionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },

  optionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Login Link Styles
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },

  loginText: {
    fontSize: 16,
    color: '#666',
  },

  loginLink: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default UserTypeSelectionScreen;