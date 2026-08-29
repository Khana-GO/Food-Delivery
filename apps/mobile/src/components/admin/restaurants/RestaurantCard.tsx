import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Restaurant } from '@food_delivery/types';

const getStatusConfig = (r: Restaurant) => {
  if (r.deletedAt) return { label: 'Deleted', bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' };
  if (!r.isActive) return { label: 'Inactive', bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' };
  if (!r.isVerified) return { label: 'Pending', bg: '#FFEDD5', text: '#EA580C', dot: '#F97316' };
  if (r.isOpen) return { label: 'Open', bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' };
  return { label: 'Closed', bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };
};

export const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const status = getStatusConfig(restaurant);
  const verifiedBadge = restaurant.isVerified ? { label: 'Verified', bg: '#DBEAFE', text: '#2563EB' } : { label: 'Unverified', bg: '#FEF3C7', text: '#D97706' };

  const handlePress = () => {
    router.push(`/(admin)/restaurants/${restaurant.id}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      className="bg-white rounded-2xl border border-gray-100 mb-3 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {/* Cover accent */}
      <View className="h-1.5" style={{ backgroundColor: status.dot }} />

      <View className="p-4 flex-row gap-3">
        <View className="w-[64px] h-[64px] rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center overflow-hidden">
          {restaurant.logoUrl ? (
            <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : restaurant.coverImageUrl ? (
            <Image source={{ uri: restaurant.coverImageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-xl font-black text-gray-400">{restaurant.name?.charAt(0).toUpperCase()}</Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="text-[15px] font-black text-[#0F172A] flex-1 leading-5" numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Feather name="chevron-right" size={16} color="#CBD5E1" />
          </View>

          <View className="flex-row items-center gap-1.5 mt-1">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F8FAFC' }}>
              <Text className="text-[10px] font-bold text-gray-600">{restaurant.cuisineType}</Text>
            </View>
            {restaurant.wardNumber ? (
              <View className="flex-row items-center gap-1">
                <Feather name="map-pin" size={10} color="#94A3B8" />
                <Text className="text-[11px] text-gray-500">Ward {restaurant.wardNumber}</Text>
              </View>
            ) : null}
          </View>

          <Text className="text-xs text-gray-500 mt-1.5 leading-4" numberOfLines={1}>
            {restaurant.address}
          </Text>

          {/* Meta row */}
          <View className="flex-row items-center gap-2 mt-2.5 flex-wrap">
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
              <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
              <Text className="text-[11px] font-extrabold" style={{ color: status.text }}>{status.label}</Text>
            </View>

            <View className="px-2 py-1 rounded-full" style={{ backgroundColor: verifiedBadge.bg }}>
              <Text className="text-[11px] font-bold" style={{ color: verifiedBadge.text }}>{verifiedBadge.label}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Feather name="star" size={12} color="#F59E0B" />
              <Text className="text-xs font-bold text-[#0F172A]">{restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}</Text>
              <Text className="text-[11px] text-gray-400">({restaurant.totalReviews || 0})</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <Feather name="truck" size={12} color="#94A3B8" />
              <Text className="text-[11px] font-medium text-gray-600">Rs. {restaurant.deliveryFee}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Feather name="shopping-bag" size={12} color="#94A3B8" />
              <Text className="text-[11px] font-medium text-gray-600">Min Rs. {restaurant.minimumOrderAmount}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
