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
    <View className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <View className="flex-row">
        {/* Image — responsive */}
        <View className="items-center justify-center w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-xl" />
          ) : (
            <Feather name="image" size={20} color="#94A3B8" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 min-w-0 ml-3">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[15px] font-bold text-gray-900 leading-tight" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-sm font-extrabold text-[#B91C1C] shrink-0" numberOfLines={1}>
              Rs. {item.price}
            </Text>
          </View>
          {item.description ? (
            <Text className="text-xs font-normal text-gray-500 mt-1 leading-4" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-1.5 mt-2">
            <View className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-[#15803D]' : 'bg-[#B91C1C]'}`} />
            <Text className={`text-[11px] font-bold ${item.isAvailable ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <Text className="text-[11px] text-gray-300">•</Text>
            <Feather name="tag" size={10} color="#94A3B8" />
            <Text className="text-[11px] text-gray-400" numberOfLines={1}>
              #{item.categoryId.slice(0, 6)}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions — fully responsive, equal flex, wrap */}
      <View className="flex-row gap-2 pt-3 mt-3 border-t border-gray-50">
        <TouchableOpacity
          activeOpacity={0.85}
          className={`flex-1 items-center justify-center px-2 py-2.5 rounded-xl border ${
            item.isAvailable ? 'bg-[#FEF2F2] border-[#FECACA]' : 'bg-[#F0FDF4] border-[#BBF7D0]'
          }`}
          onPress={() => onToggleAvailability(item.id)}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`text-xs font-bold ${item.isAvailable ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}
          >
            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-1 items-center justify-center px-2 py-2.5 rounded-xl bg-gray-50 border border-gray-200"
          onPress={() => router.push(`/(restaurant-owner)/menu/${item.id}/edit` as never)}
        >
          <Text className="text-xs font-bold text-gray-700" numberOfLines={1}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-1 items-center justify-center px-2 py-2.5 rounded-xl bg-white border border-gray-200"
          onPress={() => onDelete(item.id)}
        >
          <Feather name="trash-2" size={12} color="#B91C1C" />
        </TouchableOpacity>
      </View>
    </View>
  );
};