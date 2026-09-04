import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useReviewsForRestaurant } from '@/hooks/review/useReviewsForRestaurant';
import { useReviewStats } from '@/hooks/review/useReviewStats';
import { useDeleteReview } from '@/hooks/review/useDeleteReview';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { ReviewStatsView } from '@/components/review/ReviewStats';

export default function OwnerReviewsScreen() {
  const { data: restaurants } = useMyRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants?.[0]?.id || '');
  const { data: reviewsData, refetch } = useReviewsForRestaurant(selectedRestaurantId);
  const { data: stats } = useReviewStats(selectedRestaurantId);
  const { mutate: deleteReview } = useDeleteReview();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReview(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Reviews</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="x" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {restaurants && restaurants.length > 1 && (
        <View className="px-4 py-2">
          <Text className="mb-1 text-sm text-gray-500">Select Restaurant</Text>
          <View className="flex-row gap-2">
            {restaurants.map((r) => (
              <TouchableOpacity
                key={r.id}
                className={`px-4 py-2 rounded-full ${selectedRestaurantId === r.id ? 'bg-primary' : 'bg-gray-200'}`}
                onPress={() => setSelectedRestaurantId(r.id)}
              >
                <Text className={selectedRestaurantId === r.id ? 'text-white' : 'text-gray-600'}>
                  {r.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={reviewsData?.data || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <View className="px-4">
            <ReviewCard review={item} showActions onDelete={handleDelete} />
          </View>
        )}
        ListHeaderComponent={
          <View className="px-4 pt-4">
            {stats && <ReviewStatsView stats={stats} />}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Feather name="star" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Reviews Yet</Text>
            <Text className="mt-1 text-sm text-gray-400">Reviews will appear here</Text>
          </View>
        }
      />
    </View>
  );
}