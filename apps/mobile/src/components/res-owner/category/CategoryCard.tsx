import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Category } from '@food_delivery/types';

interface CategoryCardProps {
  category: Category;
  restaurantName?: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, restaurantName, onEdit, onDelete }: CategoryCardProps) {
  const hasItems = (category.itemCount ?? 0) > 0;

  return (
    <Pressable
      onPress={() => onEdit(category)}
      className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm shadow-gray-100 active:bg-gray-50"
    >
      <View className="flex-row items-center">
        {/* icon tile */}
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <Feather name="grid" size={18} color="#16A34A" />
        </View>

        {/* info */}
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-gray-900" numberOfLines={1}>
            {category.name}
          </Text>
          {restaurantName ? (
            <View className="mt-0.5 flex-row items-center gap-1">
              <Feather name="shopping-bag" size={10} color="#94A3B8" />
              <Text className="text-[11px] font-medium text-gray-400" numberOfLines={1}>
                {restaurantName}
              </Text>
            </View>
          ) : null}
          <View className="mt-1 flex-row items-center gap-2">
            <View
              className={`rounded-md px-2 py-0.5 ${
                hasItems ? 'bg-slate-100' : 'bg-green-50'
              }`}
            >
              <Text
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  hasItems ? 'text-slate-500' : 'text-green-600'
                }`}
              >
                {hasItems ? `${category.itemCount} item${category.itemCount === 1 ? '' : 's'}` : 'Empty'}
              </Text>
            </View>
            {hasItems ? null : (
              <Feather name="alert-circle" size={12} color="#CBD5E1" />
            )}
          </View>
        </View>

        {/* actions */}
        <View className="ml-2 flex-row items-center gap-2">
          <Pressable
            hitSlop={8}
            onPress={() => onEdit(category)}
            className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100 active:bg-slate-200"
          >
            <Feather name="edit-2" size={15} color="#475569" />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => onDelete(category)}
            disabled={hasItems}
            className={`h-9 w-9 items-center justify-center rounded-lg ${
              hasItems ? 'bg-gray-50' : 'bg-red-50 active:bg-red-100'
            }`}
          >
            <Feather name="trash-2" size={15} color={hasItems ? '#CBD5E1' : '#DC2626'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
