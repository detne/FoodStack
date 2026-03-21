import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, TableInfo } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: {
    params: {
      orderId: string;
      sessionToken?: string;
      tableInfo?: TableInfo;
    };
  };
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, sessionToken, tableInfo } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      description: 'Thanh toán trực tiếp với nhân viên',
      icon: '💵',
      available: true,
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/ghi nợ',
      description: 'Thanh toán qua thẻ ngân hàng',
      icon: '💳',
      available: true,
    },
    {
      id: 'momo',
      name: 'MoMo',
      description: 'Ví điện tử MoMo',
      icon: '📱',
      available: false, // Chưa tích hợp
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Ví điện tử ZaloPay',
      icon: '💙',
      available: false, // Chưa tích hợp
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua QR Banking',
      icon: '🏦',
      available: false, // Chưa tích hợp
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedMethod === 'cash') {
        Alert.alert(
          'Thanh toán tiền mặt',
          'Vui lòng thanh toán trực tiếp với nhân viên. Đơn hàng sẽ được cập nhật sau khi thanh toán.',
          [
            {
              text: 'Đã hiểu',
              onPress: () => {
                navigation.replace('OrderStatus', {
                  orderId,
                  sessionToken,
                  tableInfo,
                });
              }
            }
          ]
        );
      } else if (selectedMethod === 'card') {
        Alert.alert(
          'Thanh toán thẻ',
          'Vui lòng đưa thẻ cho nhân viên để thanh toán. Đơn hàng sẽ được cập nhật sau khi thanh toán.',
          [
            {
              text: 'Đã hiểu',
              onPress: () => {
                navigation.replace('OrderStatus', {
                  orderId,
                  sessionToken,
                  tableInfo,
                });
              }
            }
          ]
        );
      } else {
        // For other methods (not implemented yet)
        Alert.alert(
          'Chức năng đang phát triển',
          'Phương thức thanh toán này đang được phát triển. Vui lòng chọn phương thức khác.',
        );
      }

    } catch (error) {
      Alert.alert(
        'Lỗi thanh toán',
        'Không thể xử lý thanh toán. Vui lòng thử lại.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Thanh toán</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderId}>Đơn hàng #{orderId}</Text>
          {tableInfo && (
            <Text style={styles.tableInfo}>
              Bàn {tableInfo.table.name} - {tableInfo.restaurant.name}
            </Text>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedMethod === method.id && styles.selectedPaymentMethod,
                !method.available && styles.disabledPaymentMethod,
              ]}
              onPress={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>{method.icon}</Text>
              </View>
              
              <View style={styles.methodInfo}>
                <Text style={[
                  styles.methodName,
                  !method.available && styles.disabledText
                ]}>
                  {method.name}
                </Text>
                <Text style={[
                  styles.methodDescription,
                  !method.available && styles.disabledText
                ]}>
                  {method.description}
                </Text>
                {!method.available && (
                  <Text style={styles.comingSoonText}>Sắp ra mắt</Text>
                )}
              </View>
              
              <View style={[
                styles.radioButton,
                selectedMethod === method.id && styles.selectedRadioButton,
                !method.available && styles.disabledRadioButton,
              ]}>
                {selectedMethod === method.id && method.available && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Instructions */}
        {selectedMethod && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Hướng dẫn thanh toán</Text>
            
            {selectedMethod === 'cash' && (
              <View style={styles.instructionCard}>
                <Text style={styles.instructionIcon}>💵</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Thanh toán tiền mặt</Text>
                  <Text style={styles.instructionText}>
                    1. Nhấn "Xác nhận thanh toán" bên dưới{'\n'}
                    2. Gọi nhân viên đến bàn{'\n'}
                    3. Thanh toán trực tiếp với nhân viên{'\n'}
                    4. Nhận hóa đơn và hoàn tất
                  </Text>
                </View>
              </View>
            )}

            {selectedMethod === 'card' && (
              <View style={styles.instructionCard}>
                <Text style={styles.instructionIcon}>💳</Text>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Thanh toán thẻ</Text>
                  <Text style={styles.instructionText}>
                    1. Nhấn "Xác nhận thanh toán" bên dưới{'\n'}
                    2. Gọi nhân viên mang máy POS{'\n'}
                    3. Đưa thẻ cho nhân viên{'\n'}
                    4. Nhập mã PIN và xác nhận{'\n'}
                    5. Nhận hóa đơn và hoàn tất
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!selectedMethod || isProcessing) && styles.disabledButton
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod || isProcessing}
        >
          <LinearGradient
            colors={['#FF7A30', '#E8622A']}
            style={styles.paymentGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.paymentButtonText}>
                Xác nhận thanh toán
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  
  placeholder: {
    width: 40,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Order Info
  orderInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  tableInfo: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '500',
  },
  
  // Payment Methods
  paymentMethodsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  
  selectedPaymentMethod: {
    borderColor: '#E8622A',
    backgroundColor: '#FFF8F5',
  },
  
  disabledPaymentMethod: {
    opacity: 0.5,
    backgroundColor: '#f9f9f9',
  },
  
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  methodIconText: {
    fontSize: 20,
  },
  
  methodInfo: {
    flex: 1,
  },
  
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  methodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  comingSoonText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 4,
  },
  
  disabledText: {
    color: '#999',
  },
  
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedRadioButton: {
    borderColor: '#E8622A',
  },
  
  disabledRadioButton: {
    borderColor: '#ccc',
  },
  
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8622A',
  },
  
  // Instructions
  instructionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  
  instructionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  instructionContent: {
    flex: 1,
  },
  
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Bottom Container
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  paymentGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PaymentScreen;