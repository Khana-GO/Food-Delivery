import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
  color?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout, isAuthenticating } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ─── Handlers ───
  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    router.push('/(customer)/settings' as any);
  }, []);

  const handleAddresses = useCallback(() => {
    router.push('/(customer)/addresses' as any);
  }, []);

  const handleOrders = useCallback(() => {
    router.push('/(customer)/(tabs)/orders' as any);
  }, []);

  const handleFavorites = useCallback(() => {
    router.push('/(customer)/(tabs)/favorites' as any);
  }, []);

  const handleNotifications = useCallback(() => {
    router.push('/(customer)/notifications' as any);
  }, []);

  const handlePayment = useCallback(() => {
    router.push('/(customer)/payment' as any);
  }, []);

  const handleChatbot = useCallback(() => {
    router.push('/(customer)/chatbot' as any);
  }, []);

  // ─── Menu Items ───
  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'shopping-bag',
      label: 'My Orders',
      onPress: handleOrders,
      badge: 3,
    },
    {
      id: '2',
      icon: 'heart',
      label: 'Favorites',
      onPress: handleFavorites,
    },
    {
      id: '3',
      icon: 'map-pin',
      label: 'Saved Addresses',
      onPress: handleAddresses,
    },
    {
      id: '4',
      icon: 'credit-card',
      label: 'Payment Methods',
      onPress: handlePayment,
    },
    {
      id: '5',
      icon: 'bell',
      label: 'Notifications',
      onPress: handleNotifications,
      badge: 5,
    },
    {
      id: '6',
      icon: 'message-circle',
      label: 'Chat Support',
      onPress: handleChatbot,
    },
    {
      id: '7',
      icon: 'settings',
      label: 'Settings',
      onPress: handleEditProfile,
    },
  ];

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-primary px-6 pt-12 pb-8">
          <View className="items-center">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                  {user?.lastName?.charAt(0) || ''}
                </Text>
              )}
            </View>

            {/* Name & Email */}
            <Text className="text-xl font-bold text-white mt-3">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-sm text-white/80 mt-0.5">{user?.email}</Text>

            {/* Edit Profile Button */}
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-white/20 px-5 py-2 rounded-full mt-3"
              onPress={handleEditProfile}
            >
              <Feather name="edit-2" size={14} color="#FFF" />
              <Text className="text-white text-sm font-medium">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row px-4 -mt-4 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-black">12</Text>
            <Text className="text-xs text-gray-500">Total Orders</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-primary">4.8</Text>
            <Text className="text-xs text-gray-500">Rating</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-green-500">8</Text>
            <Text className="text-xs text-gray-500">Favorites</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-2xl mx-4 mt-4 border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center px-4 py-3.5 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <Feather name={item.icon} size={18} color="#E23744" />
              </View>
              <Text className="flex-1 ml-3 text-sm font-medium text-black">
                {item.label}
              </Text>
              {item.badge && (
                <View className="bg-primary px-2 py-0.5 rounded-full mr-2">
                  <Text className="text-white text-xs font-bold">{item.badge}</Text>
                </View>
              )}
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="mx-4 mt-4 bg-red-50 py-4 rounded-xl border border-red-200"
          onPress={() => setShowLogoutModal(true)}
          disabled={isAuthenticating}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold text-base">
              {isAuthenticating ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-center text-xs text-gray-400 mt-4 mb-6">Version 1.0.0</Text>
      </ScrollView>

      {/* ─── Logout Confirmation Modal ─── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                  <Feather name="log-out" size={32} color="#EF4444" />
                </View>
              </View>
              <Text className="text-xl font-bold text-black text-center">Logout</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to logout?
              </Text>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-gray-100"
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text className="text-black font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-red-500"
                  onPress={handleLogout}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Logout</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}