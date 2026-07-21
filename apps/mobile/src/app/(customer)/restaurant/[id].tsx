import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import { useRestaurant, useRestaurantMenu } from '@/api/restaurants';
import { useRestaurantReviews, useCreateReview } from '@/api/reviews';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addItem, getCartArray } = useCartStore();
  const cartItems = getCartArray();
  const totalInCart = cartItems.reduce((a, b) => a + b.qty, 0);

  const { data: restaurant, isLoading: isLoadingRestaurant, isError: isErrorRestaurant } = useRestaurant(id as string);
  const { data: menuData, isLoading: isLoadingMenu } = useRestaurantMenu(id as string);
  const { data: reviews, isLoading: isLoadingReviews } = useRestaurantReviews(id as string);

  const categories = menuData?.categories || [];
  const items = menuData?.items || [];

  // Automatically select the first category if none is selected
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories]);

  const activeCategoryItems = useMemo(() => {
    if (!activeCategoryId) return [];
    return items.filter((item: any) => item.categoryId === activeCategoryId);
  }, [items, activeCategoryId]);

  const addToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: id as string,
      restaurantName: restaurant?.name || 'Restaurant',
      emoji: item.emoji,
    });
  };

  if (isLoadingRestaurant) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isErrorRestaurant || !restaurant) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-red-500 font-semibold mb-4">Failed to load restaurant details.</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 bg-primary rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Hero image */}
      <View className="h-56 relative">
        <View className="flex-1 bg-slate-800 items-center justify-center">
           {restaurant.coverImageUrl ? (
             <Text className="text-white">Image placeholder</Text>
           ) : (
             <Text className="text-7xl">{restaurant.emoji || '🏔️'}</Text>
           )}
        </View>
        <TouchableOpacity 
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center" 
          onPress={() => router.back()}
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
        >
          <Text className="text-lg">↗️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="absolute top-12 right-16 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          onPress={() => toggleFavorite(id as string)}
        >
          <Text className="text-lg">{isFavorite(id as string) ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View className="bg-white mx-4 -mt-5 rounded-2xl p-4 shadow-md mb-3">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-xl font-extrabold text-slate-800 flex-1 mr-2">{restaurant.name}</Text>
            <Badge label={restaurant.isOpen ? "Open" : "Closed"} variant={restaurant.isOpen ? "success" : "neutral"} />
          </View>
          <Text className="text-sm text-slate-500 mb-3">{restaurant.cuisineType} • {restaurant.city}</Text>

          <View className="flex-row items-center mb-3">
            <View className="flex-1 items-center">
              <Text className="text-sm font-bold text-slate-800">⭐ {restaurant.averageRating}</Text>
              <Text className="text-xs text-slate-500 mt-1">{restaurant.totalReviews} reviews</Text>
            </View>
            <View className="w-[1px] h-8 bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="text-sm font-bold text-slate-800">⏱ {restaurant.estimatedDeliveryTime || 30} min</Text>
              <Text className="text-xs text-slate-500 mt-1">Delivery</Text>
            </View>
            <View className="w-[1px] h-8 bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="text-sm font-bold text-slate-800">
                {restaurant.deliveryFee === '0.00' ? 'Free' : `Rs ${restaurant.deliveryFee}`}
              </Text>
              <Text className="text-xs text-slate-500 mt-1">Fee</Text>
            </View>
          </View>

          <Text className="text-sm text-slate-500 leading-5">{restaurant.description}</Text>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 py-2 gap-2"
        >
          {categories.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full ${activeCategoryId === cat.id ? 'bg-slate-800' : 'bg-transparent'}`}
            >
              <Text
                className={`text-sm font-semibold ${activeCategoryId === cat.id ? 'text-white' : 'text-slate-500'}`}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setActiveCategoryId('REVIEWS')}
            className={`px-4 py-2 rounded-full ${activeCategoryId === 'REVIEWS' ? 'bg-slate-800' : 'bg-transparent'}`}
          >
            <Text
              className={`text-sm font-semibold ${activeCategoryId === 'REVIEWS' ? 'text-white' : 'text-slate-500'}`}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Menu/Reviews section */}
        {activeCategoryId === 'REVIEWS' ? (
          <View className="px-4 mt-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-extrabold text-slate-800">Reviews & Ratings</Text>
              <TouchableOpacity className="px-3 py-1 bg-primary/10 rounded-full">
                <Text className="text-xs font-bold text-primary">Write Review</Text>
              </TouchableOpacity>
            </View>
            
            {isLoadingReviews ? (
               <View className="py-10 items-center justify-center">
                 <ActivityIndicator color={Colors.primary} />
               </View>
            ) : reviews?.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <Text className="text-4xl mb-4">⭐</Text>
                <Text className="text-slate-800 font-bold mb-1">No Reviews Yet</Text>
                <Text className="text-slate-500 text-xs">Be the first to review this restaurant!</Text>
              </View>
            ) : (
              <View className="gap-3">
                {reviews?.map((review: any) => (
                  <View key={review.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <View className="flex-row justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                          <Text className="text-sm">👤</Text>
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-slate-800">Customer</Text>
                          <Text className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</Text>
                        </View>
                      </View>
                      <View className="bg-orange-50 px-2 py-1 rounded-md h-7 items-center justify-center border border-orange-100">
                         <Text className="text-orange-500 text-xs font-bold">★ {review.rating}</Text>
                      </View>
                    </View>
                    {review.comment && (
                      <Text className="text-sm text-slate-600 leading-5">{review.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : isLoadingMenu ? (
           <View className="py-10 items-center justify-center">
             <ActivityIndicator color={Colors.primary} />
           </View>
        ) : (
          <View className="px-4 mt-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-extrabold text-slate-800">
                {categories.find((c: any) => c.id === activeCategoryId)?.name || 'Menu'}
              </Text>
              <Text className="text-sm text-slate-500">{activeCategoryItems.length} items</Text>
            </View>

            {activeCategoryItems.length === 0 ? (
               <View className="py-10 items-center justify-center">
                 <Text className="text-slate-400">No items found in this category.</Text>
               </View>
            ) : (
              activeCategoryItems.map((item: any) => (
                <View key={item.id} className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-slate-100">
                  <View className="w-20 h-20 bg-orange-50 rounded-lg items-center justify-center mr-3">
                    {item.imageUrl ? (
                      <Text>Image</Text>
                    ) : (
                      <Text className="text-3xl">{item.emoji || '🍽️'}</Text>
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Text className="text-sm font-bold text-slate-800 flex-1">{item.name}</Text>
                      {item.isSpicy && <Text className="text-xs">🌶️</Text>}
                    </View>
                    <Text className="text-xs text-slate-500 leading-tight mb-2" numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text className="text-sm font-bold text-primary">Rs {item.price}</Text>
                  </View>

                  {item.isAvailable ? (
                    <TouchableOpacity
                      className="w-9 h-9 rounded-full bg-primary items-center justify-center ml-2"
                      onPress={() => addToCart(item)}
                    >
                      <Text className="text-white text-xl leading-7">+</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="px-2 py-1 bg-slate-100 rounded-md ml-2">
                      <Text className="text-[10px] text-slate-500 font-semibold">Sold Out</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
        
        <View className="h-28" />
      </ScrollView>

      {/* Cart floating button */}
      {totalInCart > 0 && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity
            className="bg-primary rounded-full flex-row items-center justify-center py-4 shadow-lg"
            onPress={() => router.push('/(customer)/cart' as any)}
            activeOpacity={0.9}
          >
            <View className="bg-white/30 rounded-full w-6 h-6 items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">{totalInCart}</Text>
            </View>
            <Text className="text-white text-base font-bold mr-3">View Cart</Text>
            <Text className="text-white text-base">→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
