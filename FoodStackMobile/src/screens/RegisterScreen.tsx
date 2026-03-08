import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import AuthService from '../services/authService';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  route: {
    params?: {
      userType?: 'customer' | 'partner';
    };
  };
}

const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const userType = route.params?.userType || 'customer';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Partner specific fields
  const [restaurantName, setRestaurantName] = useState('');
  const [businessType, setBusinessType] = useState<'RESTAURANT' | 'CAFE' | 'BAR' | 'FAST_FOOD'>('RESTAURANT');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (userType === 'partner' && (!restaurantName || !address)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin nhà hàng');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setIsLoading(true);
    
    try {
      if (userType === 'partner') {
        // Register as restaurant partner
        await AuthService.registerRestaurant({
          ownerName: fullName.trim(),
          ownerEmail: email.toLowerCase().trim(),
          ownerPassword: password,
          ownerPhone: phone.trim(),
          restaurantName: restaurantName.trim(),
          businessType,
          address: address.trim(),
          taxCode: taxCode.trim() || undefined,
        });
      } else {
        // Register as customer (placeholder - needs backend implementation)
        await AuthService.registerCustomer({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          phone: phone.trim(),
        });
      }
      
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigation.navigate('EmailVerification');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: 'google' | 'apple') => {
    // TODO: Implement social registration
    Alert.alert('Thông báo', `Đăng ký với ${provider} sẽ được triển khai sau`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FF7A30', '#E8622A']}
              style={styles.headerGradient}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoEmoji}>🍽️</Text>
                </View>
              </View>
              <Text style={styles.welcomeTitle}>
                {userType === 'partner' ? 'Đăng ký đối tác!' : 'Tạo tài khoản!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {userType === 'partner' 
                  ? 'Đăng ký để quản lý nhà hàng của bạn' 
                  : 'Đăng ký để bắt đầu đặt món'
                }
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Register Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {userType === 'partner' ? 'Đăng ký đối tác' : 'Đăng ký'}
              </Text>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {userType === 'partner' ? 'Tên chủ sở hữu' : 'Họ và tên'}
                </Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={20} color="#888" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#aaa"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Icon name="mail" size={20} color="#888" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="email@example.com"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color="#888" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="0123456789"
                    placeholderTextColor="#aaa"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Partner specific fields */}
              {userType === 'partner' && (
                <>
                  {/* Restaurant Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tên nhà hàng</Text>
                    <View style={styles.inputContainer}>
                      <Icon name="home" size={20} color="#888" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Nhà hàng ABC"
                        placeholderTextColor="#aaa"
                        value={restaurantName}
                        onChangeText={setRestaurantName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Business Type */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loại hình kinh doanh</Text>
                    <View style={styles.pickerContainer}>
                      <Icon name="briefcase" size={20} color="#888" />
                      <View style={styles.pickerWrapper}>
                        {['RESTAURANT', 'CAFE', 'BAR', 'FAST_FOOD'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.pickerOption,
                              businessType === type && styles.pickerOptionSelected
                            ]}
                            onPress={() => setBusinessType(type as any)}
                          >
                            <Text style={[
                              styles.pickerOptionText,
                              businessType === type && styles.pickerOptionTextSelected
                            ]}>
                              {type === 'RESTAURANT' ? 'Nhà hàng' :
                               type === 'CAFE' ? 'Quán cà phê' :
                               type === 'BAR' ? 'Quán bar' : 'Thức ăn nhanh'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Address */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Địa chỉ</Text>
                    <View style={styles.inputContainer}>
                      <Icon name="map-pin" size={20} color="#888" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                        placeholderTextColor="#aaa"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  </View>

                  {/* Tax Code (Optional) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mã số thuế (tùy chọn)</Text>
                    <View style={styles.inputContainer}>
                      <Icon name="file-text" size={20} color="#888" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="0123456789"
                        placeholderTextColor="#aaa"
                        value={taxCode}
                        onChangeText={setTaxCode}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#888" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#888" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#aaa"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FF7A30', '#E8622A']}
                  style={styles.registerButtonGradient}
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Social Register */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialText}>hoặc đăng ký với</Text>
                
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialRegister('google')}
                  >
                    <Text style={styles.socialButtonIcon}>🌐</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialRegister('apple')}
                  >
                    <Text style={styles.socialButtonIcon}>🍎</Text>
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    marginBottom: 20,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  logoEmoji: {
    fontSize: 40,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },

  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Form Styles
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },

  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  eyeButton: {
    padding: 4,
  },

  // Picker Styles
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },

  pickerWrapper: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  pickerOptionSelected: {
    backgroundColor: '#E8622A',
    borderColor: '#E8622A',
  },

  pickerOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  pickerOptionTextSelected: {
    color: '#fff',
  },

  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },

  registerButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Social Register Styles
  socialContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  socialText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },

  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },

  socialButtonIcon: {
    fontSize: 20,
  },

  socialButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
  },

  // Login Link Styles
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    fontSize: 14,
    color: '#888',
  },

  loginLink: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '700',
  },
});

export default RegisterScreen;