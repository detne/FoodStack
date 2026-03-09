import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { enhancedTheme } from '../theme/enhancedTheme';
import Icon from '../components/Icon';
import AnimatedButton from '../components/AnimatedButton';
import EnhancedCard from '../components/EnhancedCard';

type EmailVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmailVerification'>;
type EmailVerificationScreenRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

interface Props {
  navigation: EmailVerificationScreenNavigationProp;
  route: EmailVerificationScreenRouteProp;
}

const EmailVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
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

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Simple mock verification for testing
      if (otpCode === '123456') {
        Alert.alert(
          'Xác thực thành công!',
          'Tài khoản của bạn đã được kích hoạt.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Mã OTP không hợp lệ. Thử với 123456');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác thực OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setCanResend(false);
    setCountdown(60);

    try {
      // TODO: Implement resend OTP API call
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
      
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
              <Text style={styles.logoEmoji}>📧</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Xác thực email</Text>
          <Text style={styles.welcomeSubtitle}>
            Nhập mã OTP đã được gửi đến{'\n'}{email}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Verification Form */}
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
          <Text style={styles.formTitle}>Nhập mã xác thực</Text>
          <Text style={styles.formSubtitle}>
            Mã OTP gồm 6 chữ số đã được gửi đến email của bạn
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          {/* Verify Button */}
          <AnimatedButton
            title="Xác thực"
            onPress={handleVerifyOtp}
            disabled={isLoading || otp.join('').length !== 6}
            style={styles.verifyButton}
          />

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Không nhận được mã? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                <Text style={styles.resendLink}>Gửi lại</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                Gửi lại sau {countdown}s
              </Text>
            )}
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Icon name="info" size={16} color={enhancedTheme.colors.textTertiary} />
            <Text style={styles.helpText}>
              Kiểm tra cả thư mục spam nếu không thấy email
            </Text>
          </View>
        </EnhancedCard>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.background,
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
    alignItems: 'center',
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
    marginBottom: enhancedTheme.spacing.xxxl,
    lineHeight: 20,
  },

  // OTP Input Styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: enhancedTheme.spacing.xxxl,
    gap: enhancedTheme.spacing.sm,
  },

  otpInput: {
    width: 45,
    height: 55,
    borderRadius: enhancedTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: enhancedTheme.colors.surfaceLight,
    ...enhancedTheme.typography.h3,
    color: enhancedTheme.colors.textPrimary,
  },

  otpInputFilled: {
    borderColor: enhancedTheme.colors.primary,
    backgroundColor: '#FFF0E8',
  },

  verifyButton: {
    width: '100%',
    marginBottom: enhancedTheme.spacing.xl,
  },

  // Resend Styles
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.xl,
  },

  resendText: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textTertiary,
  },

  resendLink: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.primary,
    fontWeight: '700',
  },

  countdownText: {
    ...enhancedTheme.typography.body2,
    color: enhancedTheme.colors.textTertiary,
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

export default EmailVerificationScreen;