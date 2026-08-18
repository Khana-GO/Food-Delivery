import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function CategoriesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // ─── Mock Data ───
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Appetizers',
      description: 'Start your meal with delicious appetizers',
      itemCount: 12,
      image: null,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Main Course',
      description: 'Hearty and satisfying main dishes',
      itemCount: 18,
      image: null,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      name: 'Beverages',
      description: 'Refreshing drinks and beverages',
      itemCount: 8,
      image: null,
      isActive: false,
      createdAt: '2024-02-01',
    },
    {
      id: '4',
      name: 'Desserts',
      description: 'Sweet treats to end your meal',
      itemCount: 10,
      image: null,
      isActive: true,
      createdAt: '2024-02-10',
    },
  ]);

  // ─── Handlers ───
  const handleToggleStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      Alert.alert('Success', 'Category deleted successfully');
    }
  };

  const handleEdit = (categoryId: string) => {
    router.push(`/(restaurant)/categories/${categoryId}/edit` as any);
  };

  // ─── Filtered Categories ───
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Stats ───
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.isActive).length;

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
            <Text className="text-xl font-bold text-black">Categories</Text>
          </View>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
            onPress={() => router.push('/(restaurant)/categories/create' as any)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-white font-semibold text-sm">Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row px-6 py-4 gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-black">{totalCategories}</Text>
          <Text className="text-xs text-gray-500">Total Categories</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-green-600">{activeCategories}</Text>
          <Text className="text-xs text-gray-500">Active Categories</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-red-500">
            {totalCategories - activeCategories}
          </Text>
          <Text className="text-xs text-gray-500">Inactive</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredCategories.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Feather name="folder" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg font-medium mt-4">No Categories Found</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first category'}
            </Text>
          </View>
        ) : (
          filteredCategories.map((category) => (
            <View
              key={category.id}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-black">{category.name}</Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        category.isActive ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          category.isActive ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">{category.description}</Text>
                  <View className="flex-row items-center gap-4 mt-2">
                    <View className="flex-row items-center gap-1">
                      <Feather name="shopping-bag" size={14} color="#94A3B8" />
                      <Text className="text-xs text-gray-500">{category.itemCount} items</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Feather name="calendar" size={14} color="#94A3B8" />
                      <Text className="text-xs text-gray-500">Added {category.createdAt}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`px-3 py-1.5 rounded-lg ${
                      category.isActive ? 'bg-red-50' : 'bg-green-50'
                    }`}
                    onPress={() => handleToggleStatus(category.id)}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        category.isActive ? 'text-red-500' : 'text-green-600'
                      }`}
                    >
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center"
                    onPress={() => handleEdit(category.id)}
                  >
                    <Feather name="edit-2" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center"
                    onPress={() => handleDelete(category)}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowDeleteModal(false)}>
          <View className="flex-1 items-center justify-center px-6">
            <Pressable className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                  <Feather name="trash-2" size={32} color="#EF4444" />
                </View>
              </View>
              <Text className="text-xl font-bold text-black text-center">Delete Category</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete "{selectedCategory?.name}"? This will also remove all items in this category.
              </Text>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-gray-100"
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text className="text-black font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-red-500"
                  onPress={confirmDelete}
                >
                  <Text className="text-white font-semibold text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}