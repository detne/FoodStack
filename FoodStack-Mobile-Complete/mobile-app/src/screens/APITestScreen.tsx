import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiBaseUrl } from '../services/api-config';
import { storage } from '../services/api';

const APITestScreen = () => {
  const [message, setMessage] = useState('Ready to test backend connection');
  const API_BASE_URL = getApiBaseUrl();

  const testConnection = async () => {
    try {
      setMessage('Testing connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      console.log('🔗 Testing connection to:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setMessage('✅ Backend connection successful!');
        Alert.alert('Success', `Connected to backend successfully!\n\nURL: ${API_BASE_URL}`);
      } else {
        setMessage('❌ Backend connection failed');
        Alert.alert('Connection Failed', `Failed to connect to backend\n\nURL: ${API_BASE_URL}\nStatus: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      setMessage('❌ Connection error: ' + error.message);
      Alert.alert('Network Error', `Network error: ${error.message}\n\nURL: ${API_BASE_URL}`);
    }
  };

  const testBypassAdmin = async () => {
    try {
      const adminData = {
        accessToken: 'fake-admin-token',
        refreshToken: 'fake-admin-refresh',
        user: {
          id: 'admin-001',
          email: 'admin@mobile.test',
          fullName: 'Mobile Admin',
          role: 'ADMIN'
        }
      };
      
      await storage.setItem('access_token', adminData.accessToken);
      await storage.setItem('refresh_token', adminData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(adminData.user));
      
      Alert.alert('✅ Admin Login', 'Logged in as ADMIN\n\nReal credentials:\n📧 admin@mobile.test\n🔑 123456\n\nTest admin features:\n- User management\n- System settings\n- All restaurants access');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassOwner = async () => {
    try {
      const ownerData = {
        accessToken: 'fake-owner-token',
        refreshToken: 'fake-owner-refresh',
        user: {
          id: 'owner-001',
          email: 'owner@mobile.test',
          fullName: 'Mobile Restaurant Owner',
          role: 'RESTAURANT_OWNER',
          restaurantId: 'mobile-test-restaurant'
        }
      };
      
      await storage.setItem('access_token', ownerData.accessToken);
      await storage.setItem('refresh_token', ownerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(ownerData.user));
      
      Alert.alert('✅ Owner Login', 'Logged in as RESTAURANT_OWNER\n\nReal credentials:\n📧 owner@mobile.test\n🔑 123456\n\nTest owner features:\n- Restaurant dashboard\n- Branch management\n- Staff management\n- Analytics');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassManager = async () => {
    try {
      const managerData = {
        accessToken: 'fake-manager-token',
        refreshToken: 'fake-manager-refresh',
        user: {
          id: 'manager-001',
          email: 'manager@mobile.test',
          fullName: 'Mobile Manager',
          role: 'MANAGER',
          restaurantId: 'mobile-test-restaurant',
          branchId: 'mobile-test-branch'
        }
      };
      
      await storage.setItem('access_token', managerData.accessToken);
      await storage.setItem('refresh_token', managerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(managerData.user));
      
      Alert.alert('✅ Manager Login', 'Logged in as MANAGER\n\nReal credentials:\n📧 manager@mobile.test\n🔑 123456\n\nTest manager features:\n- Menu management\n- Order management\n- Branch statistics\n- Staff coordination');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassStaff = async () => {
    try {
      const staffData = {
        accessToken: 'fake-staff-token',
        refreshToken: 'fake-staff-refresh',
        user: {
          id: 'staff-001',
          email: 'staff@mobile.test',
          fullName: 'Mobile Staff',
          role: 'STAFF',
          restaurantId: 'mobile-test-restaurant',
          branchId: 'mobile-test-branch'
        }
      };
      
      await storage.setItem('access_token', staffData.accessToken);
      await storage.setItem('refresh_token', staffData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(staffData.user));
      
      Alert.alert('✅ Staff Login', 'Logged in as STAFF\n\nReal credentials:\n📧 staff@mobile.test\n🔑 123456\n\nTest staff features:\n- Order processing\n- Table management\n- Customer service\n- Basic operations');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testBypassCustomer = async () => {
    try {
      const customerData = {
        accessToken: 'fake-customer-token',
        refreshToken: 'fake-customer-refresh',
        user: {
          id: 'customer-001',
          email: 'customer@mobile.test',
          fullName: 'Mobile Customer',
          role: 'CUSTOMER'
        }
      };
      
      await storage.setItem('access_token', customerData.accessToken);
      await storage.setItem('refresh_token', customerData.refreshToken);
      await storage.setItem('user_data', JSON.stringify(customerData.user));
      
      Alert.alert('✅ Customer Login', 'Logged in as CUSTOMER\n\nReal credentials:\n📧 customer@mobile.test\n🔑 123456\n\nTest customer features:\n- QR scanning: mobile-test-qr-123\n- Menu browsing\n- Order placement\n- Order history');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FoodStack API Test</Text>
        <Text style={styles.subtitle}>Backend: {API_BASE_URL}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusMessage}>{message}</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </TouchableOpacity>
        
        <View style={styles.roleSection}>
          <Text style={styles.roleSectionTitle}>🎭 Test Different Roles:</Text>
          
          <TouchableOpacity style={[styles.roleButton, styles.adminRole]} onPress={testBypassAdmin}>
            <Text style={styles.roleButtonText}>👑 Login as ADMIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.ownerRole]} onPress={testBypassOwner}>
            <Text style={styles.roleButtonText}>🏪 Login as OWNER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.managerRole]} onPress={testBypassManager}>
            <Text style={styles.roleButtonText}>👨‍💼 Login as MANAGER</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.staffRole]} onPress={testBypassStaff}>
            <Text style={styles.roleButtonText}>👥 Login as STAFF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.roleButton, styles.customerRole]} onPress={testBypassCustomer}>
            <Text style={styles.roleButtonText}>👤 Login as CUSTOMER</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>
            1. Test backend connection first{'\n'}
            2. Choose a role to test specific features{'\n'}
            3. Navigate to different screens to test functionality{'\n'}
            4. Switch roles anytime to test different permissions{'\n'}
            5. Use real login with credentials shown above
          </Text>
        </View>
        
        <View style={styles.realLoginSection}>
          <Text style={styles.realLoginTitle}>🔐 Test Real Authentication:</Text>
          
          <TouchableOpacity style={[styles.button, styles.realLoginButton]} onPress={testRealLogin}>
            <Text style={styles.buttonText}>Test Real Login (Admin)</Text>
          </TouchableOpacity>
          
          <Text style={styles.realLoginNote}>
            This will test actual backend authentication with:{'\n'}
            📧 admin@mobile.test{'\n'}
            🔑 123456
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roleSection: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  roleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminRole: {
    backgroundColor: '#DC3545',
  },
  ownerRole: {
    backgroundColor: '#6F42C1',
  },
  managerRole: {
    backgroundColor: '#FD7E14',
  },
  staffRole: {
    backgroundColor: '#20C997',
  },
  customerRole: {
    backgroundColor: '#0D6EFD',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default APITestScreen;