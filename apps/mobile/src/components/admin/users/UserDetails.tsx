import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { User } from '@food_delivery/types';

interface UserDetailsProps {
  user: User;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onRoleChange: () => void;
}

const roleConfig: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CUSTOMER: { bg: 'bg-green-100', text: 'text-green-700' },
  RESTAURANT_OWNER: { bg: 'bg-orange-100', text: 'text-orange-700' },
  DRIVER: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export const UserDetails = ({
  user,
  onDelete,
  onRestore,
  onPermanentDelete,
  onRoleChange,
}: UserDetailsProps) => {
  const cfg = roleConfig[user.role] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View className="items-center px-6 pt-4 pb-6 bg-white border-b border-gray-100">
        <View className="items-center justify-center w-24 h-24 rounded-full bg-primary/10 overflow-hidden">
          {user.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="w-full h-full rounded-full" />
          ) : (
            <Text className="text-3xl font-bold text-primary">
              {user.firstName?.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text className="mt-3 text-xl font-bold text-black">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-sm text-gray-500">{user.email}</Text>
        <View className={`px-3 py-1 rounded-full mt-2 ${cfg.bg}`}>
          <Text className={`text-xs font-semibold ${cfg.text}`}>{user.role}</Text>
        </View>
        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1.5">
            <View className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-500">{user.isVerified ? 'Verified' : 'Unverified'}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
            <Text className="text-xs text-gray-500">{user.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        {user.deletedAt && (
          <View className="px-3 py-1 mt-2 bg-red-100 rounded-full">
            <Text className="text-xs font-medium text-red-600">Deleted on {new Date(user.deletedAt as string).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="p-4 mx-4 mt-4 bg-white border border-gray-100 rounded-xl">
        <Text className="mb-3 text-sm font-bold text-black">User Information</Text>
        <View className="flex-row items-center py-2.5 border-b border-gray-50">
          <Feather name="mail" size={16} color="#94A3B8" />
          <Text className="ml-3 text-sm text-black flex-1" selectable>{user.email}</Text>
        </View>
        <View className="flex-row items-center py-2.5 border-b border-gray-50">
          <Feather name="phone" size={16} color="#94A3B8" />
          <Text className="ml-3 text-sm text-black">{user.phone || '—'}</Text>
        </View>
        <View className="flex-row items-center py-2.5 border-b border-gray-50">
          <Feather name="calendar" size={16} color="#94A3B8" />
          <Text className="ml-3 text-sm text-black">Joined: {new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row items-center py-2.5 border-b border-gray-50">
          <Feather name="clock" size={16} color="#94A3B8" />
          <Text className="ml-3 text-sm text-black">Updated: {user.updatedAt ? new Date(user.updatedAt as string).toLocaleDateString() : '—'}</Text>
        </View>
        <View className="flex-row items-center py-2.5">
          <Feather name="log-in" size={16} color="#94A3B8" />
          <Text className="ml-3 text-sm text-black">
            Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt as string).toLocaleString() : 'Never'}
          </Text>
        </View>
        <View className="flex-row items-center py-2.5">
          <Feather name="hash" size={16} color="#94A3B8" />
          <Text className="ml-3 text-xs text-gray-400 flex-1" selectable>{user.id}</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="gap-3 px-4 mt-4 mb-6">
        {!user.deletedAt && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 bg-primary rounded-xl"
            onPress={() => router.push(`/(admin)/users/${user.id}/edit` as any)}
          >
            <Feather name="edit-2" size={18} color="#FFF" />
            <Text className="font-semibold text-white">Edit User</Text>
          </TouchableOpacity>
        )}

        {!user.deletedAt && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 border border-blue-200 bg-blue-50 rounded-xl"
            onPress={onRoleChange}
          >
            <Feather name="user-check" size={18} color="#2563EB" />
            <Text className="font-semibold text-blue-600">Change Role</Text>
          </TouchableOpacity>
        )}

        {user.deletedAt ? (
          <>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3 border border-green-200 bg-green-50 rounded-xl"
              onPress={onRestore}
            >
              <Feather name="refresh-cw" size={18} color="#16A34A" />
              <Text className="font-semibold text-green-600">Restore User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3 border border-red-200 bg-red-50 rounded-xl"
              onPress={onPermanentDelete}
            >
              <Feather name="trash-2" size={18} color="#DC2626" />
              <Text className="font-semibold text-red-600">Permanently Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 border border-red-200 bg-red-50 rounded-xl"
            onPress={onDelete}
          >
            <Feather name="user-x" size={18} color="#DC2626" />
            <Text className="font-semibold text-red-600">Soft Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
