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
import { enhancedTheme } from '../theme/enhancedTheme';
import Icon from '../components/Icon';
import AnimatedButton from '../components/AnimatedButton';
import EnhancedCard from '../components/EnhancedCard';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // Simple mock for testing
      setEmailSent(true);
      Alert.alert(
        'Email đã được gửi!',
        'Vui lòng kiểm tra email để đặt lại mật khẩu.',
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi email đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetEmail();
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
              colors={enhancedTheme.colors.primaryGradient}
              style={styles.headerGradient}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="back" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoEmoji}>🔐</Text>
                </View>
              </View>
              <Text style={styles.welcomeTitle}>Quên mật khẩu</Text>
              <Text style={styles.welcomeSubtitle}>
                Nhập email để nhận liên kết đặt lại mật khẩu
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <EnhancedCard style={styles.formCard}>
              {!emailSent ? (
                <>
                  <Text style={styles.formTitle}>Đặt lại mật khẩu</Text>
                  <Text style={styles.formSubtitle}>
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Icon name="mail" size={20} color={enhancedTheme.colors.textTertiary} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="email@example.com"
                        placeholderTextColor={enhancedTheme.colors.textLight}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Send Button */}
                  <AnimatedButton
                    title="Gửi liên kết đặt lại"
                    onPress={handleSendResetEmail}
                    disabled={isLoading}
                    style={styles.sendButton}
                  />
                </>
              ) : (
                <>
                  {/* Success State */}
                  <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                      <Text style={styles.successEmoji}>✅</Text>
                    </View>
                    <Text style={styles.successTitle}>Email đã được gửi!</Text>
                    <Text style={styles.successSubtitle}>
                      Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{'\n'}
                      <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsTitle}>Bước tiếp theo:</Text>
                      <View style={styles.instructionItem}>
                        <Text style={styles.instructionNumber}>1.</Text>
                        <Text style={styles.instructionText}>Kiểm tra hộp thư email của bạn</Text>
                      </View>
                      <View style={styles.instructionItem}>
                        <Text style={styles.instructionNumber}>2.</Text>
                        <Text style={styles.instructionText}>Nhấp vào liên kết trong email</Text>
                      </View>
                      <View style={styles.instructionItem}>
                        <Text style={styles.instructionNumber}>3.</Text>
                        <Text style={styles.instructionText}>Tạo mật khẩu mới</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendEmail}
                      disabled={isLoading}
                    >
                      <Text style={styles.resendButtonText}>Gửi lại email</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Nhớ mật khẩu? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>

              {/* Help */}
              <View style={styles.helpContainer}>
                <Icon name="info" size={16} color={enhancedTheme.colors.textTertiary} />
                <Text style={styles.helpText}>
                  Nếu không thấy email, hãy kiểm tra thư mục spam
                </Text>
              </View>
            </EnhancedCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    marginBottom: enhancedTheme.spacing.xl,
  },

  headerGradient: {
    paddingTop: enhancedTheme.spacing.lg,
    paddingBottom: enhancedTheme.spacing.xxxl,
    paddingHorizontal: enhancedTheme.spacing.xl,
    borderBottomLeftRadius: enhancedTheme.borderRadius.xxl,
    borderBottomRightRadius: enhancedTheme.borderRadius.xxl,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    top: enhancedTheme.spacing.lg,
    left: enhancedTheme.spacing.xl,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.lg,
    marginTop: enhancedTheme.spacing.xl,
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
    ...enhancedTheme.typography.h1,
    color: '#fff',
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.xs,
  },

  welcomeSubtitle: {
    ...enhancedTheme.typography.body2,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Styles
  formContainer: {
    paddingHorizontal: enhancedTheme.spacing.xl,
    paddingBottom: enhancedTheme.spacing.xl,
  },

  formCard: {
    marginTop: -enhancedTheme.spacing.xl,
  },

  formTitle: {
    ...enhancedTheme.typography.h3,
    color: enhancedTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.sm,
  },

  formSubtitle: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.xl,
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: enhancedTheme.spacing.xl,
  },

  inputLabel: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textSecondary,
    marginBottom: enhancedTheme.spacing.sm,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: enhancedTheme.colors.surfaceLight,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.sm,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },

  textInput: {
    flex: 1,
    marginLeft: enhancedTheme.spacing.sm,
    ...enhancedTheme.typography.body1,
    color: enhancedTheme.colors.textPrimary,
  },

  sendButton: {
    marginBottom: enhancedTheme.spacing.xl,
  },

  // Success State Styles
  successContainer: {
    alignItems: 'center',
  },

  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.lg,
  },

  successEmoji: {
    fontSize: 40,
  },

  successTitle: {
    ...enhancedTheme.typography.h3,
    color: enhancedTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.sm,
  },

  successSubtitle: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.xl,
    lineHeight: 20,
  },

  emailText: {
    color: enhancedTheme.colors.primary,
    fontWeight: '700',
  },

  instructionsContainer: {
    width: '100%',
    marginBottom: enhancedTheme.spacing.xl,
  },

  instructionsTitle: {
    ...enhancedTheme.typography.body1,
    color: enhancedTheme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: enhancedTheme.spacing.md,
  },

  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: enhancedTheme.spacing.sm,
  },

  instructionNumber: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.primary,
    fontWeight: '700',
    marginRight: enhancedTheme.spacing.sm,
    minWidth: 20,
  },

  instructionText: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  resendButton: {
    paddingVertical: enhancedTheme.spacing.sm,
    paddingHorizontal: enhancedTheme.spacing.lg,
    borderRadius: enhancedTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.primary,
    marginBottom: enhancedTheme.spacing.xl,
  },

  resendButtonText: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Login Link Styles
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.lg,
  },

  loginText: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textTertiary,
  },

  loginLink: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.primary,
    fontWeight: '700',
  },

  // Help Styles
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: enhancedTheme.spacing.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.md,
    gap: enhancedTheme.spacing.sm,
  },

  helpText: {
    ...enhancedTheme.typography.caption,
    color: enhancedTheme.colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
});

export default ForgotPasswordScreen;