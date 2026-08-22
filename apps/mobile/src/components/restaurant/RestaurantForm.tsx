import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface RestaurantFormProps {
  initialData?: any;
  onSubmit: (data: any, logo?: any, cover?: any) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export const RestaurantForm = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Create Restaurant',
}: RestaurantFormProps) => {
  // ─── State ───
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    wardNumber: initialData?.wardNumber || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    cuisineType: initialData?.cuisineType || '',
    openingTime: initialData?.openingTime || '',
    closingTime: initialData?.closingTime || '',
    deliveryFee: initialData?.deliveryFee?.toString() || '0',
    minimumOrderAmount: initialData?.minimumOrderAmount?.toString() || '0',
    estimatedDeliveryTime: initialData?.estimatedDeliveryTime?.toString() || '',
  });

  const [logo, setLogo] = useState<any>(null);
  const [cover, setCover] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Handlers ───
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const pickImage = useCallback(async (type: 'logo' | 'cover') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (type === 'logo') {
        setLogo(asset);
      } else {
        setCover(asset);
      }
    }
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required';
    if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const data = {
      ...formData,
      wardNumber: formData.wardNumber ? parseInt(formData.wardNumber) : undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      deliveryFee: parseFloat(formData.deliveryFee) || 0,
      minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
      estimatedDeliveryTime: formData.estimatedDeliveryTime ? parseInt(formData.estimatedDeliveryTime) : undefined,
    };

    onSubmit(data, logo, cover);
  }, [formData, logo, cover, validate, onSubmit]);

  // ─── Render ───
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Logo & Cover Upload */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="items-center justify-center w-24 h-24 bg-white border-2 border-gray-300 border-dashed rounded-xl"
            onPress={() => pickImage('logo')}
          >
            {logo?.uri ? (
              <Image source={{ uri: logo.uri }} className="w-full h-full rounded-xl" />
            ) : initialData?.logoUrl ? (
              <Image source={{ uri: initialData.logoUrl }} className="w-full h-full rounded-xl" />
            ) : (
              <View className="items-center">
                <Feather name="camera" size={24} color="#94A3B8" />
                <Text className="mt-1 text-xs text-gray-400">Logo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center justify-center flex-1 h-24 bg-white border-2 border-gray-300 border-dashed rounded-xl"
            onPress={() => pickImage('cover')}
          >
            {cover?.uri ? (
              <Image source={{ uri: cover.uri }} className="w-full h-full rounded-xl" />
            ) : initialData?.coverImageUrl ? (
              <Image source={{ uri: initialData.coverImageUrl }} className="w-full h-full rounded-xl" />
            ) : (
              <View className="items-center">
                <Feather name="image" size={24} color="#94A3B8" />
                <Text className="mt-1 text-xs text-gray-400">Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="mt-4 space-y-4">
          <View>
            <Text className="text-sm font-semibold text-black mb-1.5">Restaurant Name *</Text>
            <TextInput
              className={`border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
              placeholder="Enter restaurant name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
            {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name}</Text>}
          </View>

          <View>
            <Text className="text-sm font-semibold text-black mb-1.5">Slug *</Text>
            <TextInput
              className={`border ${errors.slug ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
              placeholder="e.g., my-restaurant"
              value={formData.slug}
              onChangeText={(text) => updateField('slug', text.toLowerCase().replace(/\s+/g, '-'))}
              autoCapitalize="none"
            />
            {errors.slug && <Text className="mt-1 text-xs text-red-500">{errors.slug}</Text>}
          </View>

          <View>
            <Text className="text-sm font-semibold text-black mb-1.5">Description</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white min-h-[80px]"
              placeholder="Describe your restaurant"
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Phone</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="9812345678"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Email</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="info@restaurant.com"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-black mb-1.5">Address *</Text>
            <TextInput
              className={`border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
              placeholder="Bhagwati Marg, Ward 3, Kathmandu"
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
            />
            {errors.address && <Text className="mt-1 text-xs text-red-500">{errors.address}</Text>}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Ward Number</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="3"
                value={formData.wardNumber}
                onChangeText={(text) => updateField('wardNumber', text)}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Cuisine Type *</Text>
              <TextInput
                className={`border ${errors.cuisineType ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
                placeholder="Nepali, Indian, Chinese"
                value={formData.cuisineType}
                onChangeText={(text) => updateField('cuisineType', text)}
              />
              {errors.cuisineType && <Text className="mt-1 text-xs text-red-500">{errors.cuisineType}</Text>}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Latitude *</Text>
              <TextInput
                className={`border ${errors.latitude ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
                placeholder="27.7172"
                value={formData.latitude}
                onChangeText={(text) => updateField('latitude', text)}
                keyboardType="decimal-pad"
              />
              {errors.latitude && <Text className="mt-1 text-xs text-red-500">{errors.latitude}</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Longitude *</Text>
              <TextInput
                className={`border ${errors.longitude ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
                placeholder="85.3240"
                value={formData.longitude}
                onChangeText={(text) => updateField('longitude', text)}
                keyboardType="decimal-pad"
              />
              {errors.longitude && <Text className="mt-1 text-xs text-red-500">{errors.longitude}</Text>}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Opening Time</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="09:00:00"
                value={formData.openingTime}
                onChangeText={(text) => updateField('openingTime', text)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Closing Time</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="22:00:00"
                value={formData.closingTime}
                onChangeText={(text) => updateField('closingTime', text)}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Delivery Fee (Rs.)</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="50"
                value={formData.deliveryFee}
                onChangeText={(text) => updateField('deliveryFee', text)}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black mb-1.5">Min Order (Rs.)</Text>
              <TextInput
                className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
                placeholder="200"
                value={formData.minimumOrderAmount}
                onChangeText={(text) => updateField('minimumOrderAmount', text)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-black mb-1.5">Est. Delivery Time (min)</Text>
            <TextInput
              className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
              placeholder="35"
              value={formData.estimatedDeliveryTime}
              onChangeText={(text) => updateField('estimatedDeliveryTime', text)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 mt-6 mb-8 ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text className="text-base font-bold tracking-wide text-center text-white">
              {submitLabel}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};