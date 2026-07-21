import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/api/users';
import { RoleSwitcher } from '@/components/common/RoleSwitcher';

const SETTINGS_MENU = [
  { id: '1', title: 'Edit Profile', icon: '👤', href: '/(customer)/edit-profile' },
  { id: '2', title: 'My Addresses', icon: '📍', href: '/(customer)/addresses' },
  { id: '3', title: 'Payment Methods', icon: '💳', href: null },
  { id: '4', title: 'Order History', icon: '🧾', href: '/(customer)/orders' },
  { id: '5', title: 'Favorites', icon: '🤍', href: null },
  { id: '6', title: 'Notifications Settings', icon: '🔔', href: null },
  { id: '7', title: 'Become a Driver', icon: '🚚', href: '/(customer)/become-driver' },
  { id: '8', title: 'Help & Support', icon: '❓', href: '/(customer)/chat' },
  { id: '9', title: 'Refer & Earn', icon: '🎁', href: null },
  { id: '10', title: 'Privacy Policy', icon: '🛡️', href: null },
  { id: '11', title: 'Terms of Service', icon: '📄', href: null },
];

export default function ProfileScreen() {
  const { logout } = useAuthStore();
  const { data: userProfile, isLoading, isError } = useProfile();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login' as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !userProfile) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-4">
        <Text className="text-red-500 font-bold mb-4 text-center">Failed to load profile data.</Text>
        <TouchableOpacity className="px-6 py-2 bg-primary rounded-full" onPress={handleLogout}>
          <Text className="text-white font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-12">
        
        {/* Profile Header */}
        <View className="flex-row items-center mb-6">
          <View className="relative mr-4">
            <View className="w-20 h-20 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
              <Text className="text-4xl">👤</Text>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-white">
              <Text className="text-xs">📷</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg font-extrabold text-slate-800">{userProfile.firstName} {userProfile.lastName}</Text>
              {userProfile.isVerified && (
                <View className="bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
                  <Text className="text-green-600 text-[10px] font-bold">Verified</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-slate-500 mb-0.5">{userProfile.email}</Text>
            <Text className="text-sm text-slate-500">{userProfile.phone || 'No phone added'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm items-center">
            <Text className="text-xs text-slate-500 mb-1 text-center min-h-[28px]">Total Orders</Text>
            <Text className="text-lg font-extrabold text-slate-800">128</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm items-center">
            <Text className="text-xs text-slate-500 mb-1 text-center min-h-[28px]">Favorite Restaurants</Text>
            <Text className="text-lg font-extrabold text-slate-800">14</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm items-center">
            <Text className="text-xs text-slate-500 mb-1 text-center min-h-[28px]">Loyalty Points</Text>
            <Text className="text-lg font-extrabold text-primary">2,450</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="gap-3 mb-3">
          {SETTINGS_MENU.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="flex-row items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
              onPress={() => item.href && router.push(item.href as any)}
            >
              <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-3">
                <Text className="text-lg">{item.icon}</Text>
              </View>
              <Text className="flex-1 text-sm font-bold text-slate-800">{item.title}</Text>
              <Text className="text-xl text-slate-300">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-3">
            <Text className="text-lg">🌙</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-800">Dark Mode</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Switch appearance</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={setIsDarkMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        {/* Role Switcher */}
        <RoleSwitcher />

        <TouchableOpacity 
          className="flex-row items-center justify-center p-4 rounded-2xl bg-red-50 mb-4 gap-2 border border-red-100"
          onPress={handleLogout}
        >
          <Text className="text-base">🚪</Text>
          <Text className="text-red-500 text-sm font-bold">Log Out</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-slate-400 text-xs mb-8">KhanaGo v2.4.1</Text>

      </ScrollView>
    </SafeAreaView>
  );
}
