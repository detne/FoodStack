import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import Icon from '../components/Icon';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    console.log('🚀 Starting login process...');
    setIsLoading(true);
    setLoadingMessage('Đang kết nối...');

    try {
      console.log('📧 Logging in with email:', email.trim());
      setLoadingMessage('Đang xác thực...');
      
      const startTime = Date.now();
      await login({ email: email.trim(), password });
      
      const loginTime = Date.now() - startTime;
      console.log(`✅ Login completed in ${loginTime}ms`);
      
      setLoadingMessage('Đăng nhập thành công!');
      
      // Small delay to show success message
      setTimeout(() => {
        navigation.replace('Home');
      }, 500);
      
    } catch (error) {
      const errorTime = Date.now();
      console.error('❌ Login error at', errorTime, ':', error);
      
      let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Kiểm tra kết nối internet và thử lại.';
        } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          errorMessage = 'Kết nối quá chậm. Vui lòng thử lại.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Email hoặc mật khẩu không đúng.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Đăng nhập thất bại', errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('UserTypeSelection');
  };

  const handleGuestAccess = () => {
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#FF7A30', '#E8622A']}
              style={styles.logoContainer}
            >
              <Text style={styles.logoIcon}>🍽️</Text>
            </LinearGradient>
            
            <Text style={styles.title}>FoodStack</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon name="email" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FF7A30', '#E8622A']}
                style={styles.loginGradient}
              >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>{loadingMessage}</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Access */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestAccess}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>Tiếp tục với tư cách khách</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Credentials */}
          {__DEV__ && (
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => {
                  setEmail('admin@foodstack.com');
                  setPassword('password123');
                }}
              >
                <Text style={styles.demoButtonText}>Admin Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => {
                  setEmail('restaurant@foodstack.com');
                  setPassword('password123');
                }}
              >
                <Text style={styles.demoButtonText}>Restaurant Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  
  logoIcon: {
    fontSize: 32,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Form
  formContainer: {
    flex: 1,
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...theme.shadows.sm,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  
  eyeButton: {
    padding: 4,
  },
  
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  
  forgotPasswordText: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '500',
  },
  
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  
  dividerText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
  },
  
  // Guest Button
  guestButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 32,
    ...theme.shadows.sm,
  },
  
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  
  registerLink: {
    fontSize: 16,
    color: '#E8622A',
    fontWeight: '600',
  },
  
  // Demo (Development only)
  demoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FFF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  demoButton: {
    backgroundColor: '#E8622A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  
  demoButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});

export default LoginScreen;