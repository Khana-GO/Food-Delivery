import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  emoji: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Steamed Chicken Momo', category: 'Appetizers', price: 220, isAvailable: true, emoji: '🥟', color: '#FFEDD5' },
  { id: '2', name: 'Napoli Pizza', category: 'Main Course', price: 540, isAvailable: true, emoji: '🍕', color: '#FEE2E2' },
  { id: '3', name: 'Veg Thali', category: 'Main Course', price: 320, isAvailable: true, emoji: '🍱', color: '#FEF3C7' },
  { id: '4', name: 'Masala Lemonade', category: 'Beverages', price: 120, isAvailable: false, emoji: '🥤', color: '#DCFCE7' },
];

export default function MenuManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Menu</Text>
          </View>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
            onPress={() => router.push('/(restaurant)/menu/create' as any)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-white font-semibold text-sm">Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search menu items..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Feather name="coffee" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg font-medium mt-4">No Menu Items Found</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first menu item'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
              <TouchableOpacity
                className="flex-row items-center"
                activeOpacity={0.7}
                onPress={() => router.push(`/(restaurant)/menu/${item.id}/edit` as any)}
              >
                <View
                  className="w-16 h-16 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-3xl">{item.emoji}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-black flex-1">{item.name}</Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        item.isAvailable ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          item.isAvailable ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-400 mt-0.5">{item.category}</Text>
                  <Text className="text-sm font-bold text-primary mt-1">Rs. {item.price}</Text>
                </View>
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleAvailability(item.id)}
                  trackColor={{ false: '#E5E7EB', true: '#F9A8A8' }}
                  thumbColor={item.isAvailable ? '#E23744' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}