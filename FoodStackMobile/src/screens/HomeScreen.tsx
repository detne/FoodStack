import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const startQRScan = () => {
    navigation.navigate('QRScan');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Hello, User!</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Icon name="bell" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={{ opacity: fadeAnim }}
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#FF7A30', '#E8622A', '#D44A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerOverlay1} />
            <View style={styles.bannerOverlay2} />
            
            <View style={styles.bannerContent}>
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>LIMITED TIME</Text>
              </View>
              <Text style={styles.bannerTitle}>Sunset Special</Text>
              <Text style={styles.bannerSubtitle}>
                Get 20% off on all dinner{'\n'}orders after 6 PM!
              </Text>
              <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
                <Text style={styles.bannerButtonText}>Claim Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={startQRScan}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF7A30', '#E8622A']}
                style={styles.quickActionIcon}
              >
                <Icon name="qr" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Scan to Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Menu', { restaurantId: 'demo' })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4FC3F7', '#0288D1']}
                style={styles.quickActionIcon}
              >
                <Icon name="menu" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Browse Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('OrderHistory')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4DB6AC', '#00897B']}
                style={styles.quickActionIcon}
              >
                <Icon name="history" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Order History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Offers')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#CE93D8', '#7B1FA2']}
                style={styles.quickActionIcon}
              >
                <Icon name="tag" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionTitle}>Special Offers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.howItWorksTitle}>How it Works</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepsRow}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepEmoji}>📍</Text>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>Find a Restaurant</Text>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepEmoji}>☝️</Text>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>Choose Your Meal</Text>
              </View>
            </View>

            <View style={styles.stepsRow}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepEmoji}>💰</Text>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>Fast Payment</Text>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepEmoji}>🛵</Text>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>Enjoy Your Food</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} activeOpacity={0.8}>
          <Icon name="home" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('OrderHistory')}
          activeOpacity={0.8}
        >
          <Icon name="orders" size={22} color="#aaa" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Offers')}
          activeOpacity={0.8}
        >
          <Icon name="offers" size={22} color="#aaa" />
          <Text style={styles.navText}>Offers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Icon name="profile" size={22} color="#aaa" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating QR Button */}
      <TouchableOpacity
        style={styles.floatingQR}
        onPress={startQRScan}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.floatingQRGradient}
        >
          <Icon name="qr" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  
  header: {
    backgroundColor: '#f5f5f0',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFE0CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  avatarText: {
    fontSize: 20,
  },
  
  welcomeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  // Banner styles
  bannerContainer: {
    margin: 16,
    marginBottom: 20,
  },

  banner: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
  },

  bannerOverlay1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  bannerOverlay2: {
    position: 'absolute',
    bottom: -40,
    right: 20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  bannerContent: {
    position: 'relative',
    zIndex: 1,
  },

  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  bannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 32,
    marginBottom: 6,
  },

  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 18,
    lineHeight: 20,
  },

  bannerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },

  bannerButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E8622A',
  },
  
  section: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  quickActionCard: {
    width: (width - 44) / 2,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },

  // How it works section
  howItWorksSection: {
    backgroundColor: '#EEE8E0',
    borderRadius: 24,
    marginHorizontal: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },

  stepsContainer: {
    gap: 16,
  },

  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  stepCard: {
    alignItems: 'center',
    flex: 1,
  },

  stepIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },

  stepEmoji: {
    fontSize: 26,
    width: 60,
    height: 60,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
  },

  stepNumber: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8622A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepNumberText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },

  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  
  bottomNav: {
    height: 68,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },

  activeNavItem: {
    // Active state styling handled by individual elements
  },

  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },

  activeNavText: {
    color: '#E8622A',
  },
  
  floatingQR: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    ...theme.shadows.lg,
  },
  
  floatingQRGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
