import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const profileSections = [
    {
      title: 'Tài khoản',
      items: [
        {
          id: 'personal-info',
          title: 'Thông tin cá nhân',
          description: 'Tên, email, số điện thoại',
          icon: '👤',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          id: 'addresses',
          title: 'Địa chỉ',
          description: 'Quản lý địa chỉ giao hàng',
          icon: '📍',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          id: 'payment-methods',
          title: 'Phương thức thanh toán',
          description: 'Thẻ, ví điện tử',
          icon: '💳',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
      ],
    },
    {
      title: 'Đơn hàng',
      items: [
        {
          id: 'order-history',
          title: 'Lịch sử đơn hàng',
          description: 'Xem các đơn hàng đã đặt',
          icon: '📋',
          onPress: () => navigation.navigate('OrderHistory'),
        },
        {
          id: 'favorites',
          title: 'Món ăn yêu thích',
          description: 'Danh sách món ăn đã lưu',
          icon: '❤️',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
      ],
    },
    {
      title: 'Cài đặt',
      items: [
        {
          id: 'notifications',
          title: 'Thông báo',
          description: 'Cài đặt thông báo đẩy',
          icon: '🔔',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          id: 'language',
          title: 'Ngôn ngữ',
          description: 'Tiếng Việt',
          icon: '🌐',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
        {
          id: 'theme',
          title: 'Giao diện',
          description: 'Sáng, tối, tự động',
          icon: '🎨',
          onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
        },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        {
          id: 'help',
          title: 'Trợ giúp',
          description: 'Câu hỏi thường gặp',
          icon: '❓',
          onPress: () => Alert.alert('Trợ giúp', 'Liên hệ support@foodstack.com để được hỗ trợ'),
        },
        {
          id: 'feedback',
          title: 'Góp ý',
          description: 'Gửi phản hồi về ứng dụng',
          icon: '💬',
          onPress: () => Alert.alert('Góp ý', 'Cảm ơn bạn đã quan tâm! Tính năng đang phát triển'),
        },
        {
          id: 'about',
          title: 'Về FoodStack',
          description: 'Phiên bản 1.0.0',
          icon: 'ℹ️',
          onPress: () => showAboutInfo(),
        },
      ],
    },
  ];

  const showAboutInfo = () => {
    Alert.alert(
      'Về FoodStack',
      'FoodStack v1.0.0\n\nỨng dụng gọi món thông minh cho nhà hàng\n\nPhát triển bởi: Nhóm FoodStack\nEmail: support@foodstack.com\n\n© 2024 FoodStack. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  const renderSection = (section: typeof profileSections[0]) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === section.items.length - 1 && styles.lastMenuItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Người dùng</Text>
              <Text style={styles.userEmail}>user@example.com</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Nhà hàng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>★ 4.8</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {profileSections.map(renderSection)}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('QRScan')}
          >
            <Text style={styles.quickActionIcon}>📱</Text>
            <Text style={styles.quickActionText}>Quét QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('RestaurantList')}
          >
            <Text style={styles.quickActionIcon}>🏪</Text>
            <Text style={styles.quickActionText}>Nhà hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
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
                    onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển')
                  },
                ]
              );
            }}
          >
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FoodStack v1.0.0</Text>
          <Text style={styles.footerSubtext}>Ứng dụng gọi món thông minh</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default ProfileScreen;