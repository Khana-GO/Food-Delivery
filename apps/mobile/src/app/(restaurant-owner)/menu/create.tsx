import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader, useResponsive } from '@/components/owner/kit';
import { MenuForm } from '@/components/owner/MenuForm';

const CATEGORIES = [
  { id: '1', name: 'Appetizers' },
  { id: '2', name: 'Main Course' },
  { id: '3', name: 'Beverages' },
  { id: '4', name: 'Desserts' },
];

export default function CreateMenuItemScreen() {
  const { isTablet } = useResponsive();

  const handleSubmit = async () => {
    // TODO: call real create mutation
    await new Promise((r) => setTimeout(r, 800));
    Alert.alert('Success', 'Menu item added to your menu.');
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Add Menu Item"
        subtitle="Create a new dish for your customers"
      />
      <View style={{ flex: 1, alignItems: isTablet ? 'center' : 'stretch' }}>
        <View style={{ width: '100%', maxWidth: isTablet ? 640 : undefined }}>
          <MenuForm categories={CATEGORIES} submitLabel="Add to Menu" onSubmit={handleSubmit} />
        </View>
      </View>
    </View>
  );
}
