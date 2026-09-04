import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RatingStars } from './RatingStars';

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => void;
  isLoading: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export const ReviewForm = ({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  isLoading,
  submitLabel = 'Submit Review',
  onCancel,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setError('');
    onSubmit(rating, comment);
  };

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
        <Text className="mb-3 text-sm font-bold text-black">Rate your experience</Text>
        <View className="items-center py-2">
          <RatingStars rating={rating} size={40} onRatingChange={setRating} />
        </View>
        {error && <Text className="mt-2 text-sm text-center text-red-500">{error}</Text>}
      </View>

      <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
        <Text className="mb-2 text-sm font-bold text-black">Your review</Text>
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-black bg-white min-h-[100px]"
          placeholder="Share your experience..."
          placeholderTextColor="#94A3B8"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row gap-3">
        {onCancel && (
          <TouchableOpacity
            className="items-center flex-1 py-4 bg-gray-100 rounded-xl"
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text className="font-semibold text-black">Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`flex-1 bg-primary rounded-xl py-4 items-center ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text className="font-bold text-white">{submitLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};