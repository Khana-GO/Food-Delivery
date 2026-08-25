import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/owner/kit';
import { CategoryForm } from '@/components/category/CategoryForm';
import { useCreateCategory } from '@/hooks/category/useCreateCategory';

export default function CreateCategoryScreen() {
  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const handleSubmit = async ({ name }: { name: string }) => {
    try {
      await createCategory({ name });
    } catch {
      // Errors surface through the store/alerts; keep the user on the form.
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="New Category"
        subtitle="Group related menu items together"
      />

      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Create Category"
      />

      <View className="px-6 pb-6">
        <View className="flex-row items-start rounded-2xl border border-green-200 bg-green-50 p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Feather name="info" size={16} color="#16A34A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-green-800">Keep it simple</Text>
            <Text className="mt-0.5 text-xs leading-4 text-green-700">
              Use short, familiar names like “Starters”, “Mains” or “Beverages”
              so customers can scan your menu quickly.
            </Text>
          </View>
          <Pressable hitSlop={8} className="p-0.5">
            <Feather name="x" size={15} color="#16A34A" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
