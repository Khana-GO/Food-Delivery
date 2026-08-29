import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MenuItem } from '@food_delivery/types';

interface MenuItemCardProps {
  item: MenuItem;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
}

export const MenuItemCard = ({ item, onDelete, onToggleAvailability }: MenuItemCardProps) => {
  return (
    <View className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl">
      <View className="flex-row">
        {/* Image */}
        <View className="items-center justify-center w-20 h-20 bg-gray-100 rounded-xl">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-xl" />
          ) : (
            <Feather name="image" size={24} color="#94A3B8" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 ml-3">
          <View className="flex-row flex-wrap items-center justify-between gap-x-2">
            <Text className="flex-shrink text-base font-bold text-black" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm font-bold text-primary">Rs. {item.price}</Text>
          </View>
          {item.description && (
            <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View className="flex-row items-center gap-2 mt-1">
            <View className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`text-xs ${item.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions — wrap instead of overflowing on narrow screens */}
      <View className="flex-row flex-wrap justify-end gap-2 pt-3 mt-3 border-t border-gray-50">
        <TouchableOpacity
          className={`min-w-[110px] items-center px-3 py-2 rounded-lg ${item.isAvailable ? 'bg-red-50' : 'bg-green-50'}`}
          onPress={() => onToggleAvailability(item.id)}
        >
          <Text className={`text-xs font-medium ${item.isAvailable ? 'text-red-500' : 'text-green-500'}`}>
            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="min-w-[64px] items-center px-3 py-2 rounded-lg bg-gray-100"
          onPress={() => router.push(`/(restaurant-owner)/menu/${item.id}/edit` as never)}
        >
          <Text className="text-xs font-medium text-gray-600">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="min-w-[64px] items-center px-3 py-2 rounded-lg bg-red-50"
          onPress={() => onDelete(item.id)}
        >
          <Text className="text-xs font-medium text-red-500">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};