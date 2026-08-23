import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader, ConfirmDialog } from '@/components/owner/kit';
import { CategoryForm } from '@/components/owner/CategoryForm';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showDelete, setShowDelete] = useState(false);

  const handleUpdate = async ({ name }: { name: string }) => {
    // TODO: call real update mutation with `id`
    await new Promise((r) => setTimeout(r, 700));
    Alert.alert('Success', `“${name}” updated.`);
    router.back();
  };

  const confirmDelete = async () => {
    setShowDelete(false);
    // TODO: call real delete mutation with `id`
    await new Promise((r) => setTimeout(r, 400));
    Alert.alert('Deleted', 'The category was removed.');
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Edit Category"
        subtitle={`ID · ${id}`}
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
        initial={{ name: 'Appetizers', isActive: true }}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="Delete category?"
        message="Items in this category will become uncategorised."
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
