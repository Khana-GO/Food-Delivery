import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { UserForm } from '@/components/admin/users/UserForm';
import { useCreateUser } from '@/hooks/admin/user/useCreateUser';

export default function CreateUserScreen() {
  const { mutate: createUser, isPending } = useCreateUser();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Create User</Text>
        </View>
      </View>

      <UserForm onSubmit={createUser} isLoading={isPending} submitLabel="Create User" />
    </View>
  );
}