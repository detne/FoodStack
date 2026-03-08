import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { OFFERS, OfferType } from '../constants/data';
import Icon from '../components/Icon';

type OffersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: OffersScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const OffersScreen: React.FC<Props> = ({ navigation }) => {
  const navigate = (to: keyof RootStackParamList) => {
    navigation.navigate(to as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Icon name="back" size={20} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Special Offers 🎁</Text>
            <Text style={styles.headerSubtitle}>Exclusive deals just for you</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </View>

      {/* Offers List */}
      <ScrollView
        style={styles.offersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.offersContent}
      >
        {OFFERS.map(offer => (
          <View key={offer.code} style={styles.offerCard}>
            <LinearGradient
              colors={offer.bg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerGradient}
            >
              {/* Background decorations */}
              <View style={styles.offerDecoration}>
                <Text style={styles.offerDecorationEmoji}>{offer.emoji}</Text>
              </View>
              
              <View style={styles.offerContent}>
                <Text style={styles.offerEmoji}>{offer.emoji}</Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.desc}</Text>
                
                <View style={styles.offerFooter}>
                  <View style={styles.offerCode}>
                    <Text style={styles.offerCodeText}>{offer.code}</Text>
                  </View>
                  <TouchableOpacity style={styles.claimButton} activeOpacity={0.8}>
                    <Text style={styles.claimButtonText}>Claim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Icon name="home" size={22} color="#aaa" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('OrderHistory')}
          activeOpacity={0.8}
        >
          <Icon name="orders" size={22} color="#aaa" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} activeOpacity={0.8}>
          <Icon name="offers" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Offers</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...theme.shadows.sm,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },

  offersList: {
    flex: 1,
  },

  offersContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },

  offerCard: {
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  offerGradient: {
    padding: 20,
    position: 'relative',
    minHeight: 140,
  },

  offerDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.15,
  },

  offerDecorationEmoji: {
    fontSize: 80,
  },

  offerContent: {
    position: 'relative',
    zIndex: 1,
  },

  offerEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },

  offerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },

  offerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 18,
  },

  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  offerCode: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  offerCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },

  claimButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  claimButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#333',
  },

  // Bottom Navigation
  bottomNav: {
    height: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
});

export default OffersScreen;