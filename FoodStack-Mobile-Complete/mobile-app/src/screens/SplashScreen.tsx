import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FoodStack</Text>
      <Text style={styles.subtitle}>Mobile App</Text>
      <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;