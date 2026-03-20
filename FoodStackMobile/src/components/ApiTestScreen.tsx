import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import { getApiBaseUrl } from '../services/api-config';

const ApiTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testServerConnection = async () => {
    addResult('🔍 Testing server connection...');
    
    try {
      const baseUrl = getApiBaseUrl().replace('/api/v1', '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        addResult('✅ Server is reachable!');
        return true;
      } else {
        addResult(`❌ Server error: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addResult('❌ Connection timeout (5s)');
      } else {
        addResult(`❌ Connection error: ${error.message}`);
      }
      return false;
    }
  };

  const testLogin = async () => {
    addResult('🔍 Testing login API...');
    
    try {
      const authData = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      addResult('✅ Login API working!');
      addResult(`User: ${authData.user.fullName} (${authData.user.role})`);
      return true;
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
      return false;
    }
  };

  const testRegister = async () => {
    addResult('🔍 Testing register API...');
    
    try {
      await AuthService.registerRestaurant({
        ownerName: 'Test Owner',
        ownerEmail: `test${Date.now()}@example.com`,
        ownerPassword: 'password123',
        ownerPhone: '0123456789',
        restaurantName: 'Test Restaurant',
        businessType: 'RESTAURANT',
        address: '123 Test Street, Test City',
      });

      addResult('✅ Register API working!');
      return true;
    } catch (error: any) {
      addResult(`❌ Register failed: ${error.message}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    
    addResult('🚀 Starting API tests...');
    addResult(`API Base URL: ${getApiBaseUrl()}`);
    addResult('');

    await testServerConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRegister();
    
    addResult('');
    addResult('✅ All tests completed!');
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connection Test</Text>
        <Text style={styles.subtitle}>Test kết nối với backend API</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Đang test...' : 'Chạy tất cả test'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testServerConnection}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Test Server</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testLogin}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Test Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testRegister}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Test Register</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.clearButtonText}>Xóa kết quả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Kết quả test:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#FF7A30',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default ApiTestScreen;