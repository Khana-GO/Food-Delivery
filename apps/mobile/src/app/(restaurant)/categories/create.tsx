import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function CreateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    image: null as string | null,
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
      setFormData((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a category description');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Category created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Create Category</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Category Image */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-black mb-2">Category Image</Text>
          <TouchableOpacity
            className={`w-full h-48 rounded-xl border-2 border-dashed ${
              formData.image ? 'border-primary' : 'border-gray-300'
            } items-center justify-center bg-white`}
            onPress={handleImagePick}
          >
            {formData.image ? (
              <View className="relative w-full h-full">
                <Image
                  source={{ uri: formData.image }}
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
            value={formData.name}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          />
        </View>

        {/* Category Description */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-black mb-2">Description *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white min-h-[100px] text-left pt-3"
            placeholder="Describe this category..."
            placeholderTextColor="#94A3B8"
            value={formData.description}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
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
                {formData.isActive
                  ? 'Category will be visible to customers'
                  : 'Category will be hidden from customers'}
              </Text>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value }))}
              trackColor={{ false: '#D1D5DB', true: '#E23744' }}
              thumbColor={formData.isActive ? '#FFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 mt-8 ${
            isLoading ? 'opacity-50' : ''
          } shadow-lg shadow-primary/25`}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text className="text-white text-center font-bold text-base tracking-wide">
              Create Category
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          className="py-3 mt-2"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-gray-500 text-center font-medium">Cancel</Text>
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}