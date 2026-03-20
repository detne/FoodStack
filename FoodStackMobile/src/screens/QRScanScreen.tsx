import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { publicApi, orderApi, storage } from '../services/api';
import { theme } from '../theme';
import Icon from '../components/Icon';

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
  const [scanStep, setScanStep] = useState(0);
  const [qrAnimating, setQrAnimating] = useState(false);
  
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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startQRScan = () => {
    setScanStep(1);
    setQrAnimating(true);
    
    setTimeout(() => {
      setScanStep(2);
      setTimeout(() => {
        setScanStep(0);
        setQrAnimating(false);
        // Navigate to menu with demo restaurant
        navigation.replace('Menu', { restaurantId: '1' });
      }, 1500);
    }, 3000);
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    setScanStep(2);

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
              setScanStep(0);
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
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
    <View style={styles.container}>
      {/* Camera background with gradient overlay */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.radialOverlay} />
      </LinearGradient>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Scan Table QR</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Icon name="torch" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Icon name="help" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Scan Frame */}
      <View style={styles.scanFrameContainer}>
        <View style={styles.scanFrame}>
          {/* Corner indicators */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          
          {/* Scan line */}
          {qrAnimating && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            />
          )}

          {/* QR detected indicator */}
          {scanStep === 2 && (
            <View style={styles.qrDetected}>
              <Text style={styles.qrDetectedIcon}>📱</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {[
          { icon: "upload", label: "Upload" }, 
          { icon: "camera", label: "Capture", active: true }, 
          { icon: "history", label: "History" }
        ].map(({ icon, label, active }) => (
          <TouchableOpacity key={label} style={styles.actionButton} activeOpacity={0.8}>
            <View style={[styles.actionButtonIcon, active && styles.activeActionButton]}>
              <Icon name={icon} size={22} color="#fff" />
            </View>
            <Text style={styles.actionButtonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.bottomPanelHandle} />
        
        <View style={styles.bottomPanelContent}>
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Icon name="info" size={18} color="#E8622A" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {scanStep === 2 ? "✅ QR Code Detected!" : "Ready to Scan"}
              </Text>
              <Text style={styles.statusDescription}>
                {scanStep === 2 
                  ? "Redirecting to menu..." 
                  : "Position the QR code on your table within the frame. Scanning will automatically redirect you to the digital menu."
                }
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.scanButton}
            onPress={startQRScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF7A30', '#E8622A']}
              style={styles.scanButtonGradient}
            >
              <Text style={styles.scanButtonText}>
                {qrAnimating ? "Scanning Automatically..." : "Start Scanning"}
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
      </View>

      {/* Hidden camera for actual scanning */}
      <CameraView
        style={styles.hiddenCamera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },

  radialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(255,120,50,0.1) 0%, transparent 60%)',
  },
  
  // Header styles
  header: {
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 19,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Scan frame
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#E8622A',
    borderWidth: 3,
  },

  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },

  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },

  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },

  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#E8622A',
    shadowColor: '#E8622A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  qrDetected: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrDetectedIcon: {
    fontSize: 40,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 24,
    position: 'relative',
    zIndex: 10,
  },

  actionButton: {
    alignItems: 'center',
    gap: 6,
  },

  actionButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeActionButton: {
    backgroundColor: '#E8622A',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    zIndex: 10,
  },

  bottomPanelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  bottomPanelContent: {
    paddingHorizontal: 20,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },

  statusDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  scanButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },

  scanButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  scanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    gap: 8,
  },

  manualIcon: {
    fontSize: 16,
  },

  manualText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  // Hidden camera for actual functionality
  hiddenCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
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
    fontSize: 80,
    marginBottom: 20,
  },
  
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  permissionContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    borderRadius: 24,
  },
  
  permissionIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  permissionDescription: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  permissionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  permissionButtonText: {
    color: '#E8622A',
    fontSize: 16,
    fontWeight: '700',
  },
  
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});

export default QRScanScreen;