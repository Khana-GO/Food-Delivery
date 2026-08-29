import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  ConfirmDialog,
  LoadingScreen,
  EmptyState,
} from '@/components/res-owner/owner/kit';
import { CategoryForm } from '@/components/res-owner/category/CategoryForm';
import { useCategory } from '@/hooks/owner/category/useCategory';
import { useUpdateCategory } from '@/hooks/owner/category/useUpdateCategory';
import { useDeleteCategory } from '@/hooks/owner/category/useDeleteCategory';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showDelete, setShowDelete] = useState(false);

  const { data: category, isLoading: isLoadingCategory } = useCategory(id);
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  if (isLoadingCategory) {
    return <LoadingScreen />;
  }

  if (!category) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Edit Category" />
        <View className="p-4">
          <EmptyState
            icon="folder"
            title="Category not found"
            message="It may have been deleted. Head back and refresh your categories."
            actionLabel="Go Back"
            onAction={() => router.back()}
          />
        </View>
      </View>
    );
  }

  const handleUpdate = async ({ name }: { name: string }) => {
    try {
      await updateCategory({ id, data: { name } });
    } catch {
      // Errors surface through the store/alerts; keep the user on the form.
    }
  };

  const confirmDelete = () =>
    deleteCategory(id, {
      onSuccess: () => {
        setShowDelete(false);
        router.back();
      },
    });

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Edit Category"
        subtitle={category.name}
        right={
          <Pressable
            onPress={() => setShowDelete(true)}
            className="flex-row items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-2 active:bg-red-100"
          >
            <Feather name="trash-2" size={14} color="#DC2626" />
            <Text className="ml-1.5 text-xs font-bold text-red-600">Delete</Text>
          </Pressable>
        }
      />

      <CategoryForm
        initialData={{ name: category.name }}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        submitLabel="Save Changes"
      />

      <ConfirmDialog
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        busy={isDeleting}
        title="Delete category?"
        message={`“${category.name}” will be permanently removed.`}
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
