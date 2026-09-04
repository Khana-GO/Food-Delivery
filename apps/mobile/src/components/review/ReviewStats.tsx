import { ReviewStats } from '@food_delivery/types';
import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RatingStars } from './RatingStars';

interface ReviewStatsProps {
  stats: ReviewStats | null;
}

export const ReviewStatsView = ({ stats }: ReviewStatsProps) => {
  if (!stats) return null;

  const { averageRating, totalReviews, ratingDistribution } = stats;

  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
      <View className="flex-row items-center gap-4">
        <View className="items-center">
          <Text className="text-4xl font-bold text-black">{averageRating}</Text>
          <RatingStars rating={Math.round(averageRating)} size={16} readonly />
          <Text className="mt-1 text-xs text-gray-400">{totalReviews} reviews</Text>
        </View>

        <View className="flex-1 gap-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <View key={star} className="flex-row items-center gap-2">
                <Text className="w-4 text-xs text-gray-500">{star}</Text>
                <View className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </View>
                <Text className="w-6 text-xs text-right text-gray-400">{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};