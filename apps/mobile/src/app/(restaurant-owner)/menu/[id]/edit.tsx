import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  ConfirmDialog,
  useResponsive,
} from '@/components/owner/kit';
import { MenuForm } from '@/components/owner/MenuForm';

const CATEGORIES = [
  { id: '1', name: 'Appetizers' },
  { id: '2', name: 'Main Course' },
  { id: '3', name: 'Beverages' },
  { id: '4', name: 'Desserts' },
];

export default function EditMenuItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showDelete, setShowDelete] = useState(false);

  const handleUpdate = async () => {
    // TODO: call real update mutation with `id`
    await new Promise((r) => setTimeout(r, 800));
    Alert.alert('Success', 'Menu item updated.');
    router.back();
  };

  const handleDelete = () => setShowDelete(true);

  const confirmDelete = async () => {
    setShowDelete(false);
    // TODO: call real delete mutation with `id`
    await new Promise((r) => setTimeout(r, 500));
    Alert.alert('Deleted', 'The menu item was removed.');
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Edit Menu Item"
        subtitle={`Item ID · ${id}`}
        right={
          <Pressable
            onPress={handleDelete}
            className="flex-row items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-2 active:bg-red-100"
          >
            <Feather name="trash-2" size={14} color="#DC2626" />
            <Text className="ml-1.5 text-xs font-bold text-red-600">Delete</Text>
          </Pressable>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignSelf: 'center', width: '100%', maxWidth: 640 }}
      >
        <MenuForm
          categories={CATEGORIES}
          initial={{
            name: 'Chicken Momo',
            description: 'Steamed chicken dumplings with spicy sesame chutney',
            price: '299',
            categoryId: '1',
            isAvailable: true,
          }}
          submitLabel="Save Changes"
          onSubmit={handleUpdate}
        />
      </ScrollView>

      <ConfirmDialog
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="Delete menu item?"
        message="This dish will be permanently removed from your menu."
        confirmLabel="Delete"
        icon="trash-2"
        tone="danger"
      />
    </View>
  );
}
