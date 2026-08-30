import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Restaurant } from '@food_delivery/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  variant?: 'grid' | 'list';
  showDistance?: boolean;
}

export const RestaurantCard = ({
  restaurant,
  isFavorite = false,
  onToggleFavorite,
  variant = 'grid',
  showDistance = false,
}: RestaurantCardProps) => {
  const handlePress = () => {
    router.push(`/(customer)/restaurant/${restaurant.id}` as any);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(restaurant.id);
    }
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity
        className="p-3 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl"
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View className="flex-row">
          {/* Image */}
          <View className="items-center justify-center w-20 h-20 bg-gray-100 rounded-xl">
            {restaurant.logoUrl ? (
              <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full rounded-xl" />
            ) : (
              <Text className="text-2xl font-bold text-gray-400">
                {restaurant.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-black" numberOfLines={1}>
                {restaurant.name}
              </Text>
              <TouchableOpacity onPress={handleFavoritePress} className="p-1">
                <Feather
                  name={isFavorite ? 'heart' : 'heart'}
                  size={18}
                  color={isFavorite ? '#E23744' : '#94A3B8'}
                />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500">{restaurant.cuisineType}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View className="flex-row items-center gap-0.5">
                <Feather name="star" size={12} color="#F59E0B" />
                <Text className="text-xs font-semibold text-black">
                  {restaurant.averageRating || 'New'}
                </Text>
              </View>
              <Text className="text-xs text-gray-300">•</Text>
              <Text className="text-xs text-gray-500">{restaurant.estimatedDeliveryTime || 30} min</Text>
              {showDistance && (
                <>
                  <Text className="text-xs text-gray-300">•</Text>
                  <Text className="text-xs text-gray-500">1.2 km</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="mb-3 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl"
      style={{ width: CARD_WIDTH }}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View className="relative h-32 bg-gray-100">
        {restaurant.coverImageUrl ? (
          <Image source={{ uri: restaurant.coverImageUrl }} className="w-full h-full" />
        ) : (
          <View className="items-center justify-center flex-1 bg-primary/10">
            <Text className="text-3xl font-bold text-gray-400">
              {restaurant.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {/* Favorite Button */}
        {onToggleFavorite && (
          <TouchableOpacity
            className="absolute items-center justify-center w-8 h-8 rounded-full shadow-sm top-2 right-2 bg-white/90"
            onPress={handleFavoritePress}
          >
            <Feather
              name={isFavorite ? 'heart' : 'heart'}
              size={16}
              color={isFavorite ? '#E23744' : '#94A3B8'}
            />
          </TouchableOpacity>
        )}
        {/* Open Status */}
        {!restaurant.isOpen && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-medium">Closed</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View className="p-3">
        <Text className="text-sm font-bold text-black" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {restaurant.cuisineType}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="flex-row items-center gap-0.5">
            <Feather name="star" size={12} color="#F59E0B" />
            <Text className="text-xs font-semibold text-black">
              {restaurant.averageRating || 'New'}
            </Text>
          </View>
          <Text className="text-xs text-gray-300">•</Text>
          <Text className="text-xs text-gray-500">
            {restaurant.estimatedDeliveryTime || 30} min
          </Text>
        </View>
        <Text className="mt-1 text-xs font-semibold text-primary">
          Rs. {restaurant.deliveryFee || 0} delivery fee
        </Text>
      </View>
    </TouchableOpacity>
  );
};