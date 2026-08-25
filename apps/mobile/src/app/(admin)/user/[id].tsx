import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'DRIVER' | 'RESTAURANT_OWNER' | 'ADMIN';
  isVerified: boolean;
  isOnline: boolean;
  createdAt: string;
  lastLoginAt: string;
  imageUrl?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // ─── Fetch user data ───
  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock data
      setUser({
        id: id as string,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        role: 'CUSTOMER',
        isVerified: true,
        isOnline: false,
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-06-01T14:20:00Z',
        imageUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=E23744&color=fff&size=100',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helpers ───
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-purple-600 bg-purple-100';
      case 'RESTAURANT_OWNER':
        return 'text-orange-600 bg-orange-100';
      case 'DRIVER':
        return 'text-blue-600 bg-blue-100';
      case 'CUSTOMER':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── Render ───
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="user-x" size={64} color="#94A3B8" />
        <Text className="text-gray-500 text-lg font-medium mt-4">User Not Found</Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">User Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 items-center border-b border-gray-100">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
            {user.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="w-24 h-24 rounded-full" />
            ) : (
              <Text className="text-3xl font-bold text-white">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Text>
            )}
          </View>
          <Text className="text-xl font-bold text-black mt-3">
            {user.firstName} {user.lastName}
          </Text>
          <View
            className={`px-3 py-1 rounded-full mt-2 ${getRoleColor(user.role)}`}
          >
            <Text className={`text-xs font-semibold`}>
              {user.role.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row px-4 py-4 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
            <Text className="text-xs text-gray-500">Status</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <View
                className={`w-2 h-2 rounded-full ${
                  user.isVerified ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <Text className="text-sm font-semibold text-black">
                {user.isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
            <Text className="text-xs text-gray-500">Online Status</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <View
                className={`w-2 h-2 rounded-full ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <Text className="text-sm font-semibold text-black">
                {user.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* User Details */}
        <View className="mx-4 bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <Text className="text-sm font-bold text-black mb-4">User Information</Text>

          <View className="flex-row items-center py-3 border-b border-gray-50">
            <Feather name="mail" size={20} color="#94A3B8" />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="text-sm text-black font-medium">{user.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-50">
            <Feather name="phone" size={20} color="#94A3B8" />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-gray-500">Phone</Text>
              <Text className="text-sm text-black font-medium">{user.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-50">
            <Feather name="calendar" size={20} color="#94A3B8" />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-gray-500">Joined On</Text>
              <Text className="text-sm text-black font-medium">{formatDate(user.createdAt)}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <Feather name="clock" size={20} color="#94A3B8" />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-gray-500">Last Login</Text>
              <Text className="text-sm text-black font-medium">
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-8 gap-3">
          <TouchableOpacity className="bg-primary py-3 rounded-xl">
            <Text className="text-white font-semibold text-center">Edit User</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-500 py-3 rounded-xl">
            <Text className="text-white font-semibold text-center">Deactivate Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}