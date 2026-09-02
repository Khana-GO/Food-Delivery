import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { CardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { Colors, Radius, Shadow } from '@/constants/theme';

const FILTERS = ['All', 'Fast Delivery', 'Top Rated', 'Free Delivery'];

export default function Explore() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [cat, setCat] = useState<string | null>(null);
  const { refetch, isRefetching } = useDashboard();
  const { popularRestaurants, recommendations, categories, featuredMenuItems, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();
  const { mutate: addFav } = useAddFavorite() as any;
  const { mutate: remFav } = useRemoveFavorite() as any;

  const all = [...popularRestaurants, ...recommendations].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

  // Build set of restaurantIds that have menu items in selected category (for Nasta/Drinks/Snacks)
  const catMeta = categories.find((c) => c.id === cat);
  const catNameLower = catMeta?.name.toLowerCase().trim() || null;
  const restaurantIdsWithCat = (() => {
    if (!cat || !catNameLower) return null;
    const set = new Set<string>();
    for (const item of featuredMenuItems || []) {
      if (item.categoryId === cat) set.add(item.restaurantId);
      else {
        const itemCatName = categories.find((c) => c.id === (item as any).categoryId)?.name.toLowerCase().trim();
        if (itemCatName === catNameLower) set.add(item.restaurantId);
      }
    }
    return set;
  })();

  const filtered = all.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.cuisineType?.toLowerCase().includes(q.toLowerCase()) && !r.address?.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat) {
      if (restaurantIdsWithCat) {
        if (restaurantIdsWithCat.size === 0) return true; // no featured mapping yet — show all instead of empty
        if (!restaurantIdsWithCat.has(r.id)) {
          if (catNameLower && r.cuisineType?.toLowerCase().includes(catNameLower)) return true;
          return false;
        }
      } else if (!r.cuisineType?.toLowerCase().includes(cat.toLowerCase())) return false;
    }
    if (filter === 'Fast Delivery' && (r.estimatedDeliveryTime ?? 99) > 30) return false;
    if (filter === 'Top Rated' && Number(r.averageRating ?? 0) < 4.2) return false;
    if (filter === 'Free Delivery' && Number(r.deliveryFee ?? 1) !== 0) return false;
    return true;
  });

  const toggle = useCallback(
    (id: string) => {
      if (favoriteIds.has(id)) remFav(id);
      else addFav(id);
    },
    [favoriteIds, addFav, remFav]
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Find your next favourite meal</Text>
          <View style={styles.search}>
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155" value={q} onChangeText={setQ} placeholder="Search restaurants, cuisines..." placeholderTextColor="#94A3B8" style={styles.input} />
            {q.length ? (
              <TouchableOpacity onPress={() => setQ('')}>
                <Feather name="x-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }} bounces={false}>
            {FILTERS.map((f) => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterActive]}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>

      {categories.length ? (
        <View style={{ paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} bounces={false}>
            {categories.map((c) => (
              <CategoryChip key={c.id} label={c.name} isSelected={cat === c.id} onPress={() => setCat(cat === c.id ? null : c.id)} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={() => refetch()} tintColor={Colors.primary} />}
      >
        {isLoading && !all.length ? <CardSkeleton count={4} variant="list" /> : null}
        {!isLoading && filtered.length === 0 ? (
          <EmptyState icon="search" title="No matches found" description="Try adjusting filters or search terms." actionLabel="Clear filters" onAction={() => { setQ(''); setCat(null); setFilter('All'); }} />
        ) : null}
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r as any} isFavorite={favoriteIds.has(r.id)} onToggleFavorite={toggle} variant="list" />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, backgroundColor: Colors.primary, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 14,
    marginTop: 12,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 10,
    ...Shadow.sm,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  filterActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  filterTextActive: { color: Colors.primary },
});
