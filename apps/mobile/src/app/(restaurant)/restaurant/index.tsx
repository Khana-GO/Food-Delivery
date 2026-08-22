import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';

export default function RestaurantsListScreen() {
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = restaurants?.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRestaurantCard = ({ item: restaurant }: { item: any }) => (
    <TouchableOpacity
      className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl"
      onPress={() => router.push(`/(restaurant)/restaurant/${restaurant.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
          {restaurant.logoUrl ? (
            <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full rounded-xl" />
          ) : (
            <Text className="text-2xl font-bold text-primary">
              {restaurant.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-black">{restaurant.name}</Text>
          <Text className="text-xs text-gray-500">{restaurant.cuisineType}</Text>
          <View className="flex-row items-center gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <View className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className={`text-xs ${restaurant.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Feather name="star" size={12} color="#F59E0B" />
              <Text className="text-xs text-black">{restaurant.averageRating || 'New'}</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">My Restaurants</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary"
            onPress={() => router.push('/(restaurant)/restaurant/create' as any)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-sm font-semibold text-white">Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center h-12 px-4 bg-white border border-gray-200 rounded-xl">
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search restaurants..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 px-4 py-3">
        <View className="flex-1 p-3 bg-white border border-gray-100 rounded-xl">
          <Text className="text-lg font-bold text-black">{restaurants?.length || 0}</Text>
          <Text className="text-xs text-gray-500">Total Restaurants</Text>
        </View>
        <View className="flex-1 p-3 bg-white border border-gray-100 rounded-xl">
          <Text className="text-lg font-bold text-green-500">
            {restaurants?.filter((r) => r.isOpen).length || 0}
          </Text>
          <Text className="text-xs text-gray-500">Open Now</Text>
        </View>
        <View className="flex-1 p-3 bg-white border border-gray-100 rounded-xl">
          <Text className="text-lg font-bold text-primary">
            {restaurants?.filter((r) => r.isVerified).length || 0}
          </Text>
          <Text className="text-xs text-gray-500">Verified</Text>
        </View>
      </View>

      {/* List */}
      {filteredRestaurants && filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      ) : (
        <View className="items-center justify-center flex-1 px-6">
          <Feather name="store" size={64} color="#D1D5DB" />
          <Text className="mt-4 text-lg font-medium text-gray-400">
            {searchQuery ? 'No restaurants found' : 'No Restaurants Yet'}
          </Text>
          <Text className="mt-1 text-sm text-center text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Create your first restaurant to get started'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-primary rounded-xl"
              onPress={() => router.push('/(restaurant)/restaurant/create' as any)}
            >
              <Text className="font-semibold text-white">Create Restaurant</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}