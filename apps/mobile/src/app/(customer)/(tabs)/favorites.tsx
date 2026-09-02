import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import EmptyState from '@/components/ui/EmptyState';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function FavoritesScreen() {
  const { refetch, isRefetching } = useFavorites();
  const { favorites, isLoading, error } = useFavoritesStore();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();

  const handleRemove = useCallback((id: string) => { if (!isRemoving) removeFavorite(id); }, [removeFavorite, isRemoving]);

  if (isLoading && favorites.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textSecondary, marginTop: 10, fontSize: 13, fontWeight: '500' }}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>{favorites.length === 0 ? 'Your favorite restaurants' : `${favorites.length} ${favorites.length === 1 ? 'restaurant' : 'restaurants'} saved`}</Text>
        </SafeAreaView>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={18} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1, gap: 10 }}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={() => refetch()} tintColor={Colors.primary} />}
        renderItem={({ item }) => {
          const restaurant = (item as any).restaurant;
          if (!restaurant) {
            return (
              <PremiumCard>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark }}>Restaurant unavailable</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>ID: {item.restaurantId}</Text>
                <TouchableOpacity onPress={() => handleRemove(item.restaurantId)} style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>Remove</Text>
                </TouchableOpacity>
              </PremiumCard>
            );
          }
          return <RestaurantCard restaurant={restaurant} isFavorite variant="list" onToggleFavorite={() => handleRemove(restaurant.id)} />;
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="heart"
              title="No favorites yet"
              description="Tap the heart on any restaurant to save it here for quick access."
              actionLabel="Explore Restaurants"
              onAction={() => router.push('/(customer)/(tabs)/explore' as any)}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  errorBox: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  errorText: { flex: 1, fontSize: 13, color: '#991B1B', fontWeight: '500' },
});
