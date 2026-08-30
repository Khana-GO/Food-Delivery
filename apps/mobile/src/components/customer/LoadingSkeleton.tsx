import React from 'react';
import { View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'grid' | 'list';
}

export const LoadingSkeleton = ({ count = 4, variant = 'grid' }: LoadingSkeletonProps) => {
  if (variant === 'list') {
    return (
      <View className="px-4">
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} className="flex-row p-3 mb-3 bg-white border border-gray-100 rounded-xl">
            <View className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
            <View className="flex-1 ml-3">
              <View className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
              <View className="w-1/2 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
              <View className="w-1/3 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="overflow-hidden bg-white border border-gray-100 rounded-xl"
          style={{ width: CARD_WIDTH }}
        >
          <View className="h-32 bg-gray-200 animate-pulse" />
          <View className="p-3">
            <View className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
            <View className="w-1/2 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
            <View className="w-1/3 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>
      ))}
    </View>
  );
};