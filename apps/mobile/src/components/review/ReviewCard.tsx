import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RatingStars } from './RatingStars';
import { Review } from '@food_delivery/types';

interface ReviewCardProps {
  review: Review;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ReviewCard = ({ review, showActions = false, onEdit, onDelete }: ReviewCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View className="p-4 mb-3 bg-white border border-gray-100 rounded-xl">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-bold text-black">{review.customerName}</Text>
          <Text className="text-xs text-gray-400">{formatDate(review.createdAt)}</Text>
        </View>
        <RatingStars rating={review.rating} size={16} readonly />
      </View>

      {review.itemName && (
        <Text className="mt-1 text-xs text-gray-500">Item: {review.itemName}</Text>
      )}

      {review.comment && (
        <Text className="mt-2 text-sm text-gray-600">{review.comment}</Text>
      )}

      {showActions && (
        <View className="flex-row justify-end gap-3 pt-3 mt-3 border-t border-gray-50">
          <TouchableOpacity onPress={() => onEdit?.(review.id)} className="flex-row items-center gap-1">
            <Feather name="edit-2" size={14} color="#666" />
            <Text className="text-sm text-gray-600">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(review.id)} className="flex-row items-center gap-1">
            <Feather name="trash-2" size={14} color="#EF4444" />
            <Text className="text-sm text-red-500">Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};