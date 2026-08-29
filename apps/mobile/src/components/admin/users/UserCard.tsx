import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { User } from '@food_delivery/types';

interface UserCardProps {
  user: User;
}

const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'ADMIN' },
  CUSTOMER: { bg: 'bg-green-100', text: 'text-green-700', label: 'CUSTOMER' },
  RESTAURANT_OWNER: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'OWNER' },
  DRIVER: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'DRIVER' },
};

export const UserCard = ({ user }: UserCardProps) => {
  const cfg = roleConfig[user.role] || { bg: 'bg-gray-100', text: 'text-gray-700', label: user.role };

  return (
    <TouchableOpacity
      className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl"
      onPress={() => router.push(`/(admin)/users/${user.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="items-center justify-center w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
          {user.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="w-full h-full rounded-full" />
          ) : (
            <Text className="text-lg font-bold text-primary">
              {user.firstName?.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-black flex-1" numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Text>
            {user.isOnline && <View className="w-2 h-2 rounded-full bg-green-500" />}
          </View>
          <Text className="text-xs text-gray-500" numberOfLines={1}>{user.email}</Text>
          {user.phone && <Text className="text-xs text-gray-400">{user.phone}</Text>}
          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
              <Text className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</Text>
            </View>
            <View className={`px-2 py-0.5 rounded-full ${user.isVerified ? 'bg-green-50' : 'bg-red-50'}`}>
              <Text className={`text-[10px] font-medium ${user.isVerified ? 'text-green-700' : 'text-red-600'}`}>
                {user.isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
            {user.deletedAt && (
              <View className="bg-red-100 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-medium text-red-600">Deleted</Text>
              </View>
            )}
          </View>
        </View>

        <Feather name="chevron-right" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
};
