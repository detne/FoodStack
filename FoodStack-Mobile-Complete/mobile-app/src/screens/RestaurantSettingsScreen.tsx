import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type RestaurantSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RestaurantSettings'>;

interface Props {
  navigation: RestaurantSettingsScreenNavigationProp;
}

const RestaurantSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [restaurantName, setRestaurantName] = useState('Nhà hàng ABC');
  const [email, setEmail] = useState('contact@restaurant.com');
  const [phone, setPhone] = useState('0901234567');
  const [address, setAddress] = useState('123 Đường ABC, Quận 1, TP.HCM');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);

  const handleSave = () => {
    Alert.alert('Thành công', 'Đã lưu cài đặt nhà hàng');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt nhà hàng</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Đăng xuất',
              'Bạn có chắc chắn muốn đăng xuất?',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Đăng xuất',
                  style: 'destructive',
                  onPress: () => navigation.navigate('Login'),
                },
              ]
            );
          }}
        >
          <Icon name="log-out" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên nhà hàng</Text>
            <TextInput
              style={styles.input}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Nhập tên nhà hàng"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giờ hoạt động</Text>
          
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Giờ mở cửa</Text>
              <TextInput
                style={styles.input}
                value={openTime}
                onChangeText={setOpenTime}
                placeholder="08:00"
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.label}>Giờ đóng cửa</Text>
              <TextInput
                style={styles.input}
                value={closeTime}
                onChangeText={setCloseTime}
                placeholder="22:00"
              />
            </View>
          </View>
        </View>

        {/* Order Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt đơn hàng</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Nhận đơn hàng</Text>
              <Text style={styles.switchDesc}>Cho phép khách hàng đặt hàng</Text>
            </View>
            <Switch
              value={isAcceptingOrders}
              onValueChange={setIsAcceptingOrders}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Tự động chấp nhận</Text>
              <Text style={styles.switchDesc}>Tự động chấp nhận đơn hàng mới</Text>
            </View>
            <Switch
              value={autoAcceptOrders}
              onValueChange={setAutoAcceptOrders}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },

  timeInput: {
    flex: 1,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  switchInfo: {
    flex: 1,
  },

  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  switchDesc: {
    fontSize: 12,
    color: '#666',
  },

  saveButton: {
    backgroundColor: '#FF7A30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default RestaurantSettingsScreen;