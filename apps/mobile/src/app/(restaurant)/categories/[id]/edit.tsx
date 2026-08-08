import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface Category {    
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  image: string | null;
  itemCount: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function EditCategory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── State ───
  const [category, setCategory] = useState<Category>({
    id: id || '1',
    name: 'Appetizers',
    description: 'Start your meal with delicious appetizers',
    isActive: true,
    image: null,
    itemCount: 12,
  });

  // ─── Handlers ───
  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCategory((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleUpdate = async () => {
    if (!category.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }
    if (!category.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a category description');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Category updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 1000));
              Alert.alert('Success', 'Category deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Edit Category</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1 px-3 py-2 rounded-lg bg-red-50"
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Feather name="trash-2" size={18} color="#EF4444" />
                <Text className="text-red-500 text-sm font-semibold">Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Category Image */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-black mb-2">Category Image</Text>
          <TouchableOpacity
            className={`w-full h-48 rounded-xl border-2 border-dashed ${
              category.image ? 'border-primary' : 'border-gray-300'
            } items-center justify-center bg-white`}
            onPress={handleImagePick}
          >
            {category.image ? (
              <View className="relative w-full h-full">
                <Image
                  source={{ uri: category.image }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30 rounded-xl items-center justify-center">
                  <Feather name="camera" size={32} color="#FFF" />
                  <Text className="text-white text-sm font-medium mt-2">Change Image</Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Feather name="image" size={48} color="#94A3B8" />
                <Text className="text-gray-500 text-sm mt-2">Tap to upload category image</Text>
                <Text className="text-gray-400 text-xs mt-1">Recommended: 1200x400px</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Name */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-black mb-2">Category Name *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white"
            placeholder="e.g., Appetizers, Main Course, Beverages"
            placeholderTextColor="#94A3B8"
            value={category.name}
            onChangeText={(text) => setCategory((prev) => ({ ...prev, name: text }))}
          />
        </View>

        {/* Category Description */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-black mb-2">Description *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white min-h-[100px] text-left pt-3"
            placeholder="Describe this category..."
            placeholderTextColor="#94A3B8"
            value={category.description}
            onChangeText={(text) => setCategory((prev) => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Category Status */}
        <View className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-black">Active Status</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {category.isActive
                  ? 'Category will be visible to customers'
                  : 'Category will be hidden from customers'}
              </Text>
            </View>
            <Switch
              value={category.isActive}
              onValueChange={(value) => setCategory((prev) => ({ ...prev, isActive: value }))}
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={category.isActive ? '#FFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Items Count */}
        <View className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Items in this category</Text>
            <Text className="text-sm font-bold text-black">{category.itemCount} items</Text>
          </View>
          <TouchableOpacity
            className="mt-3 bg-primary/10 py-2 rounded-lg"
            onPress={() => router.push('/(restaurant)/menu' as any)}
          >
            <Text className="text-primary text-sm font-semibold text-center">
              Manage Items
            </Text>
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 mt-8 ${
            isLoading ? 'opacity-50' : ''
          } shadow-lg shadow-primary/25`}
          onPress={handleUpdate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text className="text-white text-center font-bold text-base tracking-wide">
              Update Category
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}