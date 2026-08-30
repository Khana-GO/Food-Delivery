import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCategoriesByRestaurant } from '@/hooks/owner/category/useCategoriesByRestaurant';

/** Validated, submission-ready shape produced by the form. */
export interface MenuItemFormValues {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
}

type PickedImage = ImagePicker.ImagePickerAsset;

interface MenuItemFormProps {
  /** Target restaurant — scopes the category list when owner has multiple. */
  restaurantId?: string;
  initialData?: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isAvailable: boolean;
    imageUrl?: string;
  };
  onSubmit: (values: MenuItemFormValues, image?: PickedImage) => void;
  isLoading: boolean;
  submitLabel?: string;
  onDelete?: () => void;
}

export const MenuItemForm = ({
  restaurantId,
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Add Menu Item',
  onDelete,
}: MenuItemFormProps) => {
  // Categories are strictly per-restaurant — never fall back to `my` (which resolves to oldest restaurant)
  // This ensures the list matches the selected restaurantId passed from create.tsx, so
  // categoryId stored in menu_items always belongs to the same restaurant as restaurantId.
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesByRestaurant(restaurantId);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [existingImage, setExistingImage] = useState(initialData?.imageUrl || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setExistingImage(null); // remove existing image preview
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!price || isNaN(parseFloat(price))) newErrors.price = 'Valid price is required';
    if (!categoryId) newErrors.categoryId = 'Please select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset entire form when the create screen regains focus (prevents stale data
  // when user creates one item, goes back, then taps Add again).
  useFocusEffect(
    React.useCallback(() => {
      if (!initialData) {
        setName('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setIsAvailable(true);
        setImage(null);
        setExistingImage(null);
        setErrors({});
      }
    }, [initialData]),
  );

  // Sync when editing an existing item (initialData provided)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      setCategoryId(initialData.categoryId || '');
      setIsAvailable(initialData.isAvailable ?? true);
      setExistingImage(initialData.imageUrl || null);
    }
  }, [initialData]);

  // A category belongs to exactly one restaurant, so switching the target
  // restaurant invalidates any previously selected category. (In edit mode
  // the restaurant never changes, so initialData stays untouched.)
  useEffect(() => {
    if (!initialData) {
      setCategoryId('');
    }
  }, [restaurantId]);

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      categoryId,
      isAvailable,
    };
    // If a new image is selected, send it; otherwise undefined
    onSubmit(payload, image || undefined);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* Image Upload */}
      <TouchableOpacity
        className="items-center justify-center w-full h-48 mb-4 bg-white border-2 border-gray-300 border-dashed rounded-xl"
        onPress={pickImage}
      >
        {image ? (
          <Image source={{ uri: image.uri }} className="w-full h-full rounded-xl" />
        ) : existingImage ? (
          <Image source={{ uri: existingImage }} className="w-full h-full rounded-xl" />
        ) : (
          <View className="items-center">
            <Feather name="camera" size={48} color="#94A3B8" />
            <Text className="mt-2 text-sm text-gray-500">Tap to upload image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">
          Item Name <Text className="text-[#B91C1C]">*</Text>
        </Text>
        <TextInput
          className={`border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-base font-normal text-black bg-white`}
          placeholder="e.g., Chicken Momo"
          placeholderTextColor="#94A3B8"
          style={{ fontWeight: '400' }}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
        />
        {errors.name && <Text className="mt-1 text-xs font-normal text-[#B91C1C]">{errors.name}</Text>}
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Description</Text>
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white min-h-[80px]"
          placeholder="Describe your item..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Price */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">
          Price (Rs.) <Text className="text-[#B91C1C]">*</Text>
        </Text>
        <TextInput
          className={`border ${errors.price ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-base font-normal text-black bg-white`}
          placeholder="e.g., 299"
          placeholderTextColor="#94A3B8"
          style={{ fontWeight: '400' }}
          value={price}
          onChangeText={(text) => {
            setPrice(text);
            if (errors.price) setErrors({ ...errors, price: '' });
          }}
          keyboardType="decimal-pad"
        />
        {errors.price && <Text className="mt-1 text-xs font-normal text-[#B91C1C]">{errors.price}</Text>}
      </View>

      {/* Category */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">
          Category <Text className="text-[#B91C1C]">*</Text>
        </Text>
        {!restaurantId ? (
          <View className="items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Feather name="info" size={20} color="#D97706" />
            <Text className="mt-2 text-sm font-medium text-amber-700">
              Select a restaurant first
            </Text>
            <Text className="mt-0.5 text-xs text-center text-amber-600 px-4">
              Choose a restaurant above to load its categories.
            </Text>
          </View>
        ) : categoriesLoading ? (
          <View className="flex-row items-center gap-2 py-2">
            <ActivityIndicator size="small" color="#E23744" />
            <Text className="text-sm text-gray-400">Loading categories…</Text>
          </View>
        ) : categoriesError ? (
          <View className="items-center p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-sm text-red-500">
              Couldn't load categories
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              Check your connection and reopen this screen.
            </Text>
          </View>
        ) : !categories || categories.length === 0 ? (
          <View className="items-center p-4 bg-white border border-dashed border-gray-300 rounded-xl">
            <Feather name="layers" size={24} color="#94A3B8" />
            <Text className="mt-2 text-sm font-medium text-gray-500">
              No categories yet for this restaurant
            </Text>
            <Text className="mt-0.5 text-xs text-center text-gray-400 px-4">
              Create a category for the selected restaurant, then come back to add your item.
            </Text>
            <TouchableOpacity
              className="px-4 py-2 mt-3 bg-primary rounded-lg"
              onPress={() =>
                router.push({
                  pathname: '/(restaurant-owner)/categories/create',
                  params: { restaurantId },
                } as never)
              }
            >
              <Text className="text-xs font-semibold text-white">
                + Create Category
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`px-4 py-2 rounded-lg ${
                  categoryId === cat.id ? 'bg-primary' : 'bg-gray-200'
                }`}
                onPress={() => {
                  setCategoryId(cat.id);
                  if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
                }}
              >
                <Text
                  className={`text-sm font-medium ${
                    categoryId === cat.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!categoryId && categories && categories.length > 0 && (
          <Text className="mt-1.5 text-xs text-gray-400">
            Choose one — items are grouped under it on the customer menu.
          </Text>
        )}
        {errors.categoryId && <Text className="mt-1 text-xs text-red-500">{errors.categoryId}</Text>}
      </View>

      {/* Availability */}
      <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-black">Available</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {isAvailable ? 'Visible to customers' : 'Hidden from customers'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#D1D5DB', true: '#E23744' }}
            thumbColor={isAvailable ? '#FFF' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        className={`bg-primary rounded-xl py-4 ${isLoading ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text className="text-base font-bold text-center text-white">{submitLabel}</Text>
        )}
      </TouchableOpacity>

      {/* Delete (if edit mode) */}
      {onDelete && (
        <TouchableOpacity
          className="py-4 mt-3 border border-red-200 bg-red-50 rounded-xl"
          onPress={onDelete}
          disabled={isLoading}
        >
          <Text className="text-base font-bold text-center text-red-500">Delete Item</Text>
        </TouchableOpacity>
      )}

      <View className="h-6" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};