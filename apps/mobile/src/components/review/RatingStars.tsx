import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars = ({
  rating,
  max = 5,
  size = 24,
  readonly = false,
  onRatingChange,
}: RatingStarsProps) => {
  const handlePress = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View className="flex-row">
      {Array.from({ length: max }, (_, i) => i + 1).map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => handlePress(value)}
          disabled={readonly}
          activeOpacity={0.7}
          className="mr-1"
        >
          <Feather
            name={value <= rating ? 'star' : 'star'}
            size={size}
            color={value <= rating ? '#F59E0B' : '#D1D5DB'}
            style={value <= rating ? { fill: '#F59E0B' } : {}}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};