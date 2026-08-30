import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useRestaurantDetail } from '@/hooks/customer/useRestaurantDetail';
import { MenuItemCard } from '@/components/customer/MenuItemCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { MenuItem } from '@food_delivery/types';
import { useCartStore } from '@/stores/customer/cartStore';
import { Colors, Radius, Shadow } from '@/constants/theme';
import AnimatedPage from '@/components/ui/AnimatedPage';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurant, menuData, isLoading, error } = useRestaurantDetail(id);
  const { items: cartItems, addItem, removeItem, totalItems, totalPrice, restaurantId } = useCartStore();
  const { width } = useWindowDimensions();
  const isVeryCompact = width < 360;

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (menuData && menuData.length > 0 && !activeCategoryId) {
      setActiveCategoryId(menuData[0].categoryId);
    }
  }, [menuData]);

  // Reset search when changing category for cleaner UX
  const handleCategoryPress = (catId: string) => {
    setActiveCategoryId(catId);
  };

  const currentCategory = useMemo(() => {
    if (!activeCategoryId || !menuData) return null;
    return menuData.find((g) => g.categoryId === activeCategoryId) || null;
  }, [activeCategoryId, menuData]);

  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    if (!searchQuery.trim()) return currentCategory.items;
    const q = searchQuery.toLowerCase();
    return currentCategory.items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)
    );
  }, [currentCategory, searchQuery]);

  const getItemQuantity = (itemId: string) => cartItems.find((i) => i.menuItemId === itemId)?.quantity || 0;

  const handleAddItem = (item: MenuItem) => {
    if (restaurantId && restaurantId !== restaurant?.id) {
      useCartStore.getState().clearCart();
    }
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      restaurantId: restaurant?.id || null,
    });
  };

  const handleRemoveItem = (itemId: string) => removeItem(itemId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ height: 220, backgroundColor: '#F1F5F9' }} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ height: 16, backgroundColor: '#E2E8F0', borderRadius: 8, width: '44%' }} />
          <View style={{ height: 90, backgroundColor: '#E2E8F0', borderRadius: Radius.xl }} />
          <View style={{ height: 90, backgroundColor: '#E2E8F0', borderRadius: Radius.xl }} />
        </View>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.background }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' }}>
          <Feather name="alert-circle" size={32} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.textDark }}>Failed to load restaurant</Text>
        <Text style={{ marginTop: 6, fontSize: 13, color: Colors.textSecondary, textAlign: 'center' }}>This restaurant may be unavailable or pending approval.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: Colors.textDark, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.full }}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Hero */}
      <View style={{ height: 260, backgroundColor: '#1F2937' }}>
        {restaurant.coverImageUrl ? (
          <Image source={{ uri: restaurant.coverImageUrl }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56 }}>🏔️</Text>
          </View>
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,23,42,0.18)' } as any]} />
        <TouchableOpacity onPress={() => router.back()} style={styles.heroBtnLeft}>
          <Feather name="arrow-left" size={18} color={Colors.textDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.heroBtnRight}>
          <Feather name="share-2" size={16} color={Colors.textDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.heroBtnRight2}>
          <Feather name="heart" size={16} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.heroTitleWrap}>
          <Text style={styles.heroTitle} numberOfLines={1}>{restaurant.name}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>{restaurant.cuisineType} • {restaurant.address}</Text>
        </View>
      </View>

      <AnimatedPage slide>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Info Card – premium */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.logoWrap}>
                {restaurant.logoUrl ? (
                  <Image source={{ uri: restaurant.logoUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.primary }}>{restaurant.name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark, flex: 1, marginRight: 8 }} numberOfLines={1}>{restaurant.name}</Text>
                  <View style={[styles.badge, restaurant.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                    <View style={[styles.dot, restaurant.isOpen ? { backgroundColor: '#15803D' } : { backgroundColor: '#B91C1C' }]} />
                    <Text style={[styles.badgeText, restaurant.isOpen ? { color: '#15803D' } : { color: '#B91C1C' }]}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{restaurant.cuisineType}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Stat label="Rating" value={`⭐ ${restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New'}`} sub={`${restaurant.totalReviews || 0} reviews`} />
              <View style={styles.divider} />
              <Stat label="Delivery" value={`${restaurant.estimatedDeliveryTime || 30} min`} sub="Est. time" />
              <View style={styles.divider} />
              <Stat label="Fee" value={`Rs. ${restaurant.deliveryFee || 0}`} sub="Delivery" />
              <View style={styles.divider} />
              <Stat label="Min order" value={`Rs. ${restaurant.minimumOrderAmount || 0}`} sub="Minimum" />
            </View>

            {restaurant.description ? <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 }}>{restaurant.description}</Text> : null}
          </View>

          {/* Search by categories / dishes */}
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            <View style={[styles.searchWrap, isVeryCompact && { height: 44, paddingHorizontal: 12 } as any]}>
              <Feather name="search" size={isVeryCompact ? 16 : 18} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={isVeryCompact ? 'Search dishes...' : 'Search dishes in this restaurant...'}
                placeholderTextColor="#94A3B8"
                style={[styles.searchInput, isVeryCompact && { fontSize: 13 } as any]}
                allowFontScaling={false}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Categories – chips with search integration */}
          {menuData && menuData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 14 }} bounces={false}>
              {menuData.map((group) => (
                <CategoryChip
                  key={group.categoryId}
                  label={`${group.categoryName || 'Category'} • ${group.items.length}`}
                  isSelected={activeCategoryId === group.categoryId}
                  onPress={() => handleCategoryPress(group.categoryId)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ marginTop: 16, marginHorizontal: 16, padding: 20, backgroundColor: '#FFFFFF', borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', alignItems: 'center' }}>
              <Feather name="grid" size={24} color="#CBD5E1" />
              <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: Colors.textSecondary }}>No menu yet</Text>
              <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' }}>This verified restaurant hasn’t added dishes yet.</Text>
            </View>
          )}

          {/* Menu Items */}
          {currentCategory ? (
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>{currentCategory.categoryName || 'Menu'}</Text>
                <View style={{ backgroundColor: Colors.textDark, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full }}>
                  <Text style={{ fontSize: 11, color: '#FFF', fontWeight: '700' }}>{filteredItems.length} items</Text>
                </View>
              </View>

              {filteredItems.length === 0 ? (
                <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E2E8F0', alignItems: 'center' }}>
                  <Feather name="search" size={20} color="#CBD5E1" />
                  <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: Colors.textSecondary }}>No dishes match “{searchQuery}”</Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginTop: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textDark }}>Clear search</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} quantity={getItemQuantity(item.id)} onAdd={handleAddItem} onRemove={handleRemoveItem} />
                ))
              )}
            </View>
          ) : null}
        </ScrollView>
      </AnimatedPage>

      {/* Floating Cart Bar – premium */}
      {totalItems > 0 && restaurantId === restaurant?.id ? (
        <View style={styles.cartBarWrap}>
          <TouchableOpacity onPress={() => router.push('/(customer)/cart' as any)} activeOpacity={0.92} style={styles.cartBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                <Text style={{ color: '#FFF', fontWeight: '800' }}>{totalItems}</Text>
              </View>
              <View>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>View Cart</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Rs. {totalPrice}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Checkout</Text>
                <Feather name="arrow-right" size={14} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>{value}</Text>
      <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 2, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontSize: 10, color: Colors.textTertiary }}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.md,
  },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeOpen: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  badgeClosed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F1F5F9' },
  divider: { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: '#E2E8F0' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    gap: 10,
    ...Shadow.xs,
  },
  searchInput: { flex: 1, minWidth: 0 as any, fontSize: 14, color: Colors.textDark, paddingVertical: 0, fontWeight: '500' },
  heroBtnLeft: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  heroBtnRight: {
    position: 'absolute',
    top: 52,
    right: 62,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  heroBtnRight2: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  heroTitleWrap: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226,232,240,0.8)',
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 },
  heroSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  cartBarWrap: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cartBar: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    ...Shadow.primaryLg,
  },
});
