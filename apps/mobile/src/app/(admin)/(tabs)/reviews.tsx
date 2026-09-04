import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useDeleteReview } from '@/hooks/review/useDeleteReview';

export default function AdminReviewsScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => reviewService.adminGetAll({ page, limit: 20 }),
  });
  const { mutate: deleteReview } = useDeleteReview();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReview(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">All Reviews</Text>
        <Text className="text-sm text-gray-500">{data?.total || 0} total reviews</Text>
      </View>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <View className="px-4">
            <ReviewCard review={item} showActions onDelete={handleDelete} />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Feather name="star" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Reviews</Text>
          </View>
        }
      />
    </View>
  );
}