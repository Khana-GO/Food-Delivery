import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ReviewForm } from '@/components/review/ReviewForm';
import { useCreateReview } from '@/hooks/review/useCreateReview';
import { goBack } from '@/lib/navigation';

export default function CreateReviewScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { mutate: createReview, isPending } = useCreateReview();

  const handleSubmit = (rating: number, comment: string) => {
    createReview({ restaurantId, rating, comment });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => goBack('/(customer)/reviews')} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Write a Review</Text>
        </View>
      </View>
      <ReviewForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Post Review" onCancel={() => goBack('/(customer)/reviews')} />
    </View>
  );
}