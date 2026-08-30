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
  const { popularRestaurants, recommendations, categories, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();
  const { mutate: addFav } = useAddFavorite() as any;
  const { mutate: remFav } = useRemoveFavorite() as any;

  const all = [...popularRestaurants, ...recommendations].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
  const filtered = all.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat) {
      // simple: if cuisine contains cat name
      if (!r.cuisineType?.toLowerCase().includes(cat.toLowerCase())) return false;
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
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Find your next favourite meal</Text>
          <View style={styles.search}>
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput value={q} onChangeText={setQ} placeholder="Search restaurants, cuisines..." placeholderTextColor="#94A3B8" style={styles.input} />
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
        </View>
      </SafeAreaView>

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
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', ...Shadow.xs },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 14,
    marginTop: 12,
    borderRadius: Radius.xl,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterActive: { backgroundColor: Colors.textDark, borderColor: Colors.textDark },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
  filterTextActive: { color: '#FFFFFF' },
});
