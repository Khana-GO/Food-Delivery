import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/owner/kit';
import { CategoryForm } from '@/components/owner/CategoryForm';

export default function CreateCategoryScreen() {
  const handleSubmit = async ({ name }: { name: string }) => {
    // TODO: call real create mutation
    await new Promise((r) => setTimeout(r, 700));
    Alert.alert('Success', `“${name}” category created.`);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="New Category" subtitle="Organise your dishes into groups" />
      <CategoryForm submitLabel="Create Category" onSubmit={handleSubmit} />
    </View>
  );
}
