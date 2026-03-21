import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const sections = [
    { 
      title: "Account", 
      items: [
        { icon: "settings", label: "Edit Profile" }, 
        { icon: "wallet", label: "Payment Methods" }, 
        { icon: "bell", label: "Notifications" }
      ] 
    },
    { 
      title: "More", 
      items: [
        { icon: "history", label: "Order History", action: () => navigation.navigate("OrderHistory") }, 
        { icon: "tag", label: "Offers & Rewards" }, 
        { icon: "help", label: "Help & Support" }
      ] 
    },
    { 
      title: "Settings", 
      items: [
        { 
          icon: "log-out", 
          label: "Logout", 
          action: () => {
            Alert.alert(
              'Đăng xuất',
              'Bạn có chắc chắn muốn đăng xuất?',
              [
                { text: 'Hủy', style: 'cancel' },
                { 
                  text: 'Đăng xuất', 
                  style: 'destructive',
                  onPress: () => navigation.navigate('Login')
                },
              ]
            );
          },
          isLogout: true
        }
      ] 
    },
  ];

  const navigate = (to: keyof RootStackParamList) => {
    navigation.navigate(to as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Hello, User!</Text>
                <Text style={styles.userEmail}>user@example.com</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              {[
                { val: "12", label: "Orders" }, 
                { val: "5", label: "Restaurants" }, 
                { val: "4.8", label: "Rating" }
              ].map(stat => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.val}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Sections */}
      <ScrollView
        style={styles.sectionsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionsContent}
      >
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.sectionItem,
                    index < section.items.length - 1 && styles.sectionItemBorder,
                    item.isLogout && styles.logoutItem
                  ]}
                  onPress={item.action || (() => Alert.alert('Feature', 'Coming soon!'))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sectionItemIcon, item.isLogout && styles.logoutIcon]}>
                    <Icon name={item.icon} size={16} color={item.isLogout ? "#ff4444" : "#E8622A"} />
                  </View>
                  <Text style={[styles.sectionItemLabel, item.isLogout && styles.logoutLabel]}>{item.label}</Text>
                  <Icon name="chevron" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
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
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Offers')}
          activeOpacity={0.8}
        >
          <Icon name="offers" size={22} color="#aaa" />
          <Text style={styles.navText}>Offers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} activeOpacity={0.8}>
          <Icon name="profile" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
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
    zIndex: 10,
  },

  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },

  headerContent: {
    alignItems: 'center',
    gap: 12,
  },

  profileSection: {
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  avatarText: {
    fontSize: 36,
  },

  userInfo: {
    alignItems: 'center',
  },

  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },

  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 24,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },

  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  sectionsContainer: {
    flex: 1,
  },

  sectionsContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom nav
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#888',
    marginBottom: 8,
    paddingLeft: 4,
  },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },

  sectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f0',
  },

  sectionItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  logoutItem: {
    backgroundColor: '#FFF5F5',
  },

  logoutIcon: {
    backgroundColor: '#FFEBEE',
  },

  logoutLabel: {
    color: '#ff4444',
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

export default ProfileScreen;