import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function RestaurantsListScreen() {
  const insets = useSafeAreaInsets();
  const { data: restaurants, isLoading, refetch, isRefetching } = useMyRestaurants();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => restaurants?.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()) || r.cuisineType.toLowerCase().includes(search.trim().toLowerCase()) || r.address.toLowerCase().includes(search.trim().toLowerCase())) ?? [],
    [restaurants, search]
  );

  const openCount = restaurants?.filter((r) => r.isOpen).length ?? 0;
  const verifiedCount = restaurants?.filter((r) => r.isVerified).length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Premium crimson header */}
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <Feather name="package" size={16} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>My Stores</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', marginTop: 1 }} numberOfLines={1}>
                {restaurants?.length ?? 0} total • {openCount} open • {verifiedCount} verified
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)}
            style={{ backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center', gap: 6, ...Shadow.sm }}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={14} color={Colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.primary }}>Add Store</Text>
          </TouchableOpacity>
        </View>

        {/* translucent stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[
            { label: 'TOTAL', value: restaurants?.length ?? 0, icon: 'layers' as const },
            { label: 'OPEN', value: openCount, icon: 'zap' as const },
            { label: 'VERIFIED', value: verifiedCount, icon: 'shield' as const },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Feather name={s.icon} size={12} color={Colors.white} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white, marginTop: 4 }}>{s.value}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* search translucent */}
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.14)',
            borderRadius: Radius.xl,
            paddingHorizontal: 12,
            height: 42,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <Feather name="search" size={14} color={Colors.white} />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 13, color: Colors.white }}
            placeholder="Search stores, cuisine, address…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Feather name="x-circle" size={16} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 32 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="package" size={28} color={Colors.primary} />
              </View>
              <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{search ? 'No matches' : 'No restaurants yet'}</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>
                {search ? `Nothing matches “${search}”.` : 'Create your first store and start selling.'}
              </Text>
              {!search ? (
                <TouchableOpacity onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)} style={{ marginTop: 14, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full }} activeOpacity={0.7}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>Create Restaurant</Text>
                </TouchableOpacity>
              ) : null}
            </PremiumCard>
          )
        }
        renderItem={({ item }) => (
          <PremiumCard elevation="sm" padding={0} pressable onPress={() => router.push(`/(restaurant-owner)/restaurant/${item.id}` as any)} style={{ overflow: 'hidden' }}>
            {/* cover */}
            <View style={{ height: 96, backgroundColor: Colors.backgroundAlt }}>
              {item.coverImageUrl ? (
                <Image source={{ uri: item.coverImageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.backgroundAlt }}>
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight }}>
                    <Feather name="image" size={18} color={Colors.textMuted} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary }}>No cover photo</Text>
                </View>
              )}
              {/* status pill overlay - crimson for open to match UI */}
              <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: item.isOpen ? Colors.primary : 'rgba(15,15,15,0.75)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>{item.isOpen ? 'OPEN' : 'CLOSED'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: -24 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.white, ...Shadow.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                {item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>{item.name.charAt(0).toUpperCase()}</Text>}
              </View>
              <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Text style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: '800', color: Colors.textDark }} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryBg, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FECDD3', flexShrink: 0 }}>
                    <Feather name="star" size={11} color={Colors.primary} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>{item.averageRating ? Number(item.averageRating).toFixed(1) : 'New'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">{item.cuisineType} • {item.address}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Feather name="clock" size={11} color={Colors.textTertiary} />
                    <Text style={{ fontSize: 11, color: Colors.textTertiary }}>{item.openingTime?.slice(0, 5) || '--:--'} – {item.closingTime?.slice(0, 5) || '--:--'}</Text>
                  </View>
                  {item.isVerified ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FECDD3' }}>
                      <Feather name="check" size={10} color={Colors.primary} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>Verified</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: Colors.backgroundAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textTertiary }}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.textTertiary} style={{ marginLeft: 6 }} />
            </View>
          </PremiumCard>
        )}
      />
    </View>
  );
}
