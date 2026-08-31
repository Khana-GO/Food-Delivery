import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Address } from '@food_delivery/types';

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }: AddressCardProps) => {
  return (
    <TouchableOpacity
      className={`p-4 rounded-xl border ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'} mb-3`}
      onPress={() => onSelect?.(address.id)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-black">{address.label || 'Home'}</Text>
            {address.isDefault && (
              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] text-primary font-medium">Default</Text>
              </View>
            )}
          </View>
          <Text className="mt-1 text-sm text-gray-600">{address.addressLine}</Text>
          <Text className="text-sm text-gray-600">
            {address.city}, {address.country}
          </Text>
          {address.postalCode && (
            <Text className="text-sm text-gray-500">Postal: {address.postalCode}</Text>
          )}
        </View>
        {isSelected && <Feather name="check-circle" size={20} color="#E23744" />}
      </View>

      <View className="flex-row gap-4 pt-3 mt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-row items-center gap-1" onPress={() => onEdit?.(address.id)}>
          <Feather name="edit-2" size={14} color="#666" />
          <Text className="text-sm text-gray-600">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1" onPress={() => onDelete?.(address.id)}>
          <Feather name="trash-2" size={14} color="#EF4444" />
          <Text className="text-sm text-red-500">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};