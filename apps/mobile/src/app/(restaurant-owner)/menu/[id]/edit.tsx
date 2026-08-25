import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MenuItemForm } from '@/components/menu-item/MenuItemForm';
import { useMenuItem } from '@/hooks/menu-item/useMenuItem';
import { useUpdateMenuItem } from '@/hooks/menu-item/useUpdateMenuItem';
import { useDeleteMenuItem } from '@/hooks/menu-item/useDeleteMenuItem';
import type { MenuItemFormValues } from '@/components/menu-item/MenuItemForm';
import type { UpdateMenuItemPayload } from '@food_delivery/types';
import * as ImagePicker from 'expo-image-picker';

export default function EditMenuItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, isLoading: isLoadingItem } = useMenuItem(id);
  const { mutate: updateMenuItem, isPending: isUpdating } = useUpdateMenuItem();
  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMenuItem(id) },
      ]
    );
  };

  const handleSubmit = (
    values: MenuItemFormValues,
    image?: ImagePicker.ImagePickerAsset,
  ) => {
    // Only send fields that actually changed
    const payload: UpdateMenuItemPayload = {};
    if (values.name !== item?.name) payload.name = values.name;
    if (values.description !== item?.description)
      payload.description = values.description;
    if (values.price !== item?.price) payload.price = values.price;
    if (values.categoryId !== item?.categoryId)
      payload.categoryId = values.categoryId;
    if (values.isAvailable !== item?.isAvailable)
      payload.isAvailable = values.isAvailable;

    // A newly picked image replaces the stored one
    if (image) payload.image = image;

    updateMenuItem({ id, data: payload });
  };

  if (isLoadingItem) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="menu" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Item Not Found</Text>
        <TouchableOpacity
          className="px-6 py-3 mt-6 bg-primary rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Edit Menu Item</Text>
          </View>
        </View>
      </View>

      <MenuItemForm
        restaurantId={item.restaurantId}
        initialData={{
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl,
        }}
        onSubmit={handleSubmit}
        isLoading={isUpdating || isDeleting}
        submitLabel="Update Menu Item"
        onDelete={handleDelete}
      />
    </View>
  );
}