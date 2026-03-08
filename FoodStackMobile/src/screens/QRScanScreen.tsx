import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { publicApi, orderApi, storage } from '../services/api';
import { theme } from '../theme';

type QRScanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QRScan'>;

interface Props {
  navigation: QRScanScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

const QRScanScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const scanLinePosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    try {
      // Extract QR token from data
      const qrToken = data.includes('/') ? data.split('/').pop() : data;
      
      if (!qrToken) {
        throw new Error('Invalid QR code format');
      }

      // Get table info
      const tableInfo = await publicApi.getTableByQR(qrToken);
      
      // Store table info
      await storage.setTableInfo(tableInfo);

      // Create order session
      const session = await orderApi.createSession(qrToken);

      // Navigate to menu
      navigation.replace('Menu', {
        tableInfo,
        sessionToken: session.session_token,
      });

    } catch (error) {
      console.error('QR Scan Error:', error);
      Alert.alert(
        'Lỗi quét mã',
        error instanceof Error ? error.message : 'Không thể quét mã QR',
        [
          {
            text: 'Thử lại',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
        ]
      );
    }
  };

  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scanAreaSize - 4],
  });

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingIcon}>📱</Text>
            <Text style={styles.loadingText}>Đang yêu cầu quyền camera...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={styles.permissionContainer}
        >
          <View style={styles.permissionContent}>
            <Text style={styles.permissionIcon}>🚫</Text>
            <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
            <Text style={styles.permissionDescription}>
              Ứng dụng cần quyền truy cập camera để quét mã QR trên bàn ăn
            </Text>
            
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => Camera.requestCameraPermissionsAsync()}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Cấp quyền</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Quét mã QR</Text>
              <Text style={styles.headerSubtitle}>Hướng camera vào mã QR trên bàn</Text>
            </View>
            
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Camera Container */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scan area */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            
            {/* Scan Area */}
            <View style={styles.scanArea}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              {/* Scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            </View>
            
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Camera Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
          <Text style={styles.controlIcon}>🖼️</Text>
          <Text style={styles.controlText}>Upload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.captureButton} 
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.captureGradient}
          >
            <Text style={styles.captureIcon}>📷</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
          <Text style={styles.controlIcon}>🕒</Text>
          <Text style={styles.controlText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { opacity: fadeAnim }]}>
        <View style={styles.bottomSheetHandle} />
        
        <View style={styles.bottomSheetContent}>
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Text style={styles.statusEmoji}>ℹ️</Text>
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Ready to Scan</Text>
              <Text style={styles.statusDescription}>
                Position the QR code on your table within the frame. Scanning will automatically redirect you to the digital menu.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.scanningButton}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.scanningGradient}
            >
              <Text style={styles.scanningButtonText}>
                {loading ? 'Scanning Automatically...' : 'Scanning Automatically...'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => navigation.navigate('Menu', { restaurantId: 'demo' })}
            activeOpacity={0.8}
          >
            <Text style={styles.manualIcon}>⌨️</Text>
            <Text style={styles.manualText}>Enter code manually</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {scanned && (
        <View style={styles.rescanContainer}>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.rescanButtonText}>Quét lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  
  // Header styles
  header: {
    zIndex: 10,
  },
  
  headerGradient: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerButtonText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  
  // Camera styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  
  camera: {
    flex: 1,
  },
  
  // Overlay styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  overlayMiddle: {
    flexDirection: 'row',
    height: scanAreaSize,
  },
  
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Scan area styles
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
  },
  
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    borderWidth: 4,
  },
  
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: theme.borderRadius.md,
  },
  
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: theme.borderRadius.md,
  },
  
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  
  // Instructions styles
  cameraControls: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  controlButton: {
    alignItems: 'center',
    opacity: 0.8,
  },
  
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  controlText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '500',
  },
  
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  
  captureGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  captureIcon: {
    fontSize: 28,
  },
  
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area
  },
  
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  statusEmoji: {
    fontSize: 20,
  },
  
  statusTextContainer: {
    flex: 1,
  },
  
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  
  statusDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  
  scanningButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  scanningGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  scanningButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: theme.colors.gray100,
    borderRadius: 12,
  },
  
  manualIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  manualText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  
  // Rescan styles
  rescanContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  
  rescanButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  
  rescanButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingContent: {
    alignItems: 'center',
  },
  
  loadingIcon: {
    fontSize: theme.fontSize['5xl'],
    marginBottom: theme.spacing.lg,
  },
  
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    textAlign: 'center',
  },
  
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  permissionContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
  },
  
  permissionIcon: {
    fontSize: theme.fontSize['5xl'],
    marginBottom: theme.spacing.lg,
  },
  
  permissionTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  
  permissionDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  
  permissionButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  
  permissionButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  
  backButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  
  backButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    opacity: 0.8,
  },
});

export default QRScanScreen;