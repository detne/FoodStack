import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, sessionToken, tableInfo } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'qr_payment',
      name: 'QR Payment',
      description: 'Scan QR code to pay with your mobile banking app',
      icon: '📱',
    },
    {
      id: 'cash',
      name: 'Cash',
      description: 'Pay with cash when staff arrives',
      icon: '💵',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with card when staff arrives',
      icon: '💳',
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please choose a payment method to continue');
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === 'qr_payment') {
        // Simulate QR payment flow
        Alert.alert(
          'QR Payment',
          'A QR code will be generated for you to scan with your banking app. This feature will be available soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to order status
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // For cash and card payments
        Alert.alert(
          'Payment Request Sent',
          `Staff has been notified that you want to pay with ${selectedMethod === 'cash' ? 'cash' : 'card'}. They will be with you shortly.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to order status
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Payment Method</Text>
        <Text style={styles.subtitle}>Order #{orderId.slice(-8)}</Text>
        <Text style={styles.tableInfo}>Table {tableInfo.table.name}</Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.methodsSection}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodContent}>
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && <View style={styles.radioButtonSelected} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Payment Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Restaurant:</Text>
          <Text style={styles.infoValue}>{tableInfo.restaurant.name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Branch:</Text>
          <Text style={styles.infoValue}>{tableInfo.branch.name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Table:</Text>
          <Text style={styles.infoValue}>{tableInfo.table.name}</Text>
        </View>
      </View>

      {/* Security Notice */}
      <View style={styles.securitySection}>
        <Text style={styles.securityTitle}>🔒 Secure Payment</Text>
        <Text style={styles.securityText}>
          Your payment information is processed securely. We do not store your payment details.
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedMethod || processing) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod || processing}
        >
          <Text style={styles.continueButtonText}>
            {processing ? 'Processing...' : 'Continue Payment'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  tableInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  methodsSection: {
    padding: 20,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMethod: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  securitySection: {
    backgroundColor: '#f0f9ff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;