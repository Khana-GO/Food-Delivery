import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CategoryChipProps {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const CategoryChip = ({ label, isSelected = false, onPress }: CategoryChipProps) => {
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 ${
        isSelected ? 'bg-primary' : 'bg-white border border-gray-200'
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};