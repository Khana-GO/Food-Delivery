import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

// ─── Responsive scale ──────────────────────────────────────────────
const scale = (size: number, width: number) => (width / 375) * size;

export default function RestaurantsListScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: restaurants, isLoading, refetch, isRefetching } = useMyRestaurants();
  const [search, setSearch] = useState('');

  // ─── Responsive sizes ────────────────────────────────────────────
  const s = (size: number) => scale(size, width);
  const fontSize = {
    tiny: s(9),
    small: s(11),
    base: s(13),
    medium: s(14),
    large: s(18),
    xl: s(20),
  };
  const spacing = {
    xs: s(4),
    sm: s(8),
    md: s(12),
    lg: s(16),
    xl: s(20),
    xxl: s(24),
  };

  // ─── Computed values ─────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      restaurants?.filter(
        (r) =>
          r.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          r.cuisineType.toLowerCase().includes(search.trim().toLowerCase()) ||
          r.address.toLowerCase().includes(search.trim().toLowerCase())
      ) ?? [],
    [restaurants, search]
  );

  const openCount = restaurants?.filter((r) => r.isOpen).length ?? 0;
  const verifiedCount = restaurants?.filter((r) => r.isVerified).length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        {/* Title row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <View
              style={{
                width: s(36),
                height: s(36),
                borderRadius: s(18),
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Feather name="package" size={s(16)} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: Colors.white,
                  fontSize: fontSize.large,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                My Stores
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: fontSize.small,
                  fontWeight: '600',
                  marginTop: spacing.xs,
                }}
                numberOfLines={1}
              >
                {restaurants?.length ?? 0} total • {openCount} open • {verifiedCount} verified
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)}
            style={{
              backgroundColor: Colors.white,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: Radius.full,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              ...Shadow.sm,
            }}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={s(14)} color={Colors.primary} />
            <Text style={{ fontSize: fontSize.small, fontWeight: '800', color: Colors.primary }}>
              Add Store
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Stats row ───────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          {[
            { label: 'TOTAL', value: restaurants?.length ?? 0, icon: 'layers' as const },
            { label: 'OPEN', value: openCount, icon: 'zap' as const },
            { label: 'VERIFIED', value: verifiedCount, icon: 'shield' as const },
          ].map((s, index) => {
            const isVerified = index === 2;
            return (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: isVerified ? Colors.white : 'rgba(255,255,255,0.14)',
                  borderRadius: Radius.xl,
                  padding: spacing.sm,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isVerified ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                  ...(isVerified ? Shadow.sm : {}),
                }}
              >
                <Feather
                  name={s.icon}
                  size={scale(12, width)}
                  color={isVerified ? Colors.primary : Colors.white}
                />
                <Text
                  style={{
                    fontSize: fontSize.medium,
                    fontWeight: '800',
                    color: isVerified ? Colors.textDark : Colors.white,
                    marginTop: spacing.xs,
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.tiny,
                    fontWeight: '700',
                    color: isVerified ? Colors.textSecondary : 'rgba(255,255,255,0.85)',
                    letterSpacing: 0.5,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ─── Search bar ───────────────────────────────────────────── */}
        <View
          style={{
            marginTop: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.white,
            borderRadius: Radius.xl,
            paddingHorizontal: spacing.md,
            height: s(42),
            borderWidth: 1,
            borderColor: Colors.borderLight,
            ...Shadow.sm,
          }}
        >
          <Feather name="search" size={s(14)} color={Colors.textTertiary} />
          <TextInput
            selectionColor="rgba(15,23,42,0.16)"
            cursorColor="#334155"
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              fontSize: fontSize.base,
              color: Colors.textDark,
              paddingVertical: 0,
            }}
            placeholder="Search stores, cuisine, address…"
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Feather name="x-circle" size={s(16)} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── List ───────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={!!isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <PremiumCard
              elevation="sm"
              style={{ alignItems: 'center', paddingVertical: spacing.xl }}
            >
              <View
                style={{
                  width: s(64),
                  height: s(64),
                  borderRadius: s(32),
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="package" size={s(28)} color={Colors.primary} />
              </View>
              <Text
                style={{
                  marginTop: spacing.md,
                  fontSize: fontSize.medium,
                  fontWeight: '700',
                  color: Colors.textDark,
                }}
              >
                {search ? 'No matches' : 'No restaurants yet'}
              </Text>
              <Text
                style={{
                  marginTop: spacing.xs,
                  fontSize: fontSize.small,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  paddingHorizontal: spacing.xl,
                }}
              >
                {search
                  ? `Nothing matches “${search}”.`
                  : 'Create your first store and start selling.'}
              </Text>
              {!search && (
                <TouchableOpacity
                  onPress={() => router.push('/(restaurant-owner)/restaurant/create' as any)}
                  style={{
                    marginTop: spacing.md,
                    backgroundColor: Colors.primary,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.sm,
                    borderRadius: Radius.full,
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: '700',
                      color: Colors.white,
                    }}
                  >
                    Create Restaurant
                  </Text>
                </TouchableOpacity>
              )}
            </PremiumCard>
          )
        }
        renderItem={({ item }) => (
          <PremiumCard
            elevation="sm"
            padding={0}
            pressable
            onPress={() => router.push(`/(restaurant-owner)/restaurant/${item.id}` as any)}
            style={{ overflow: 'hidden' }}
          >
            {/* ── Cover image ── */}
            <View style={{ height: s(96), backgroundColor: Colors.backgroundAlt }}>
              {item.coverImageUrl ? (
                <Image
                  source={{ uri: item.coverImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.md,
                    backgroundColor: Colors.backgroundAlt,
                  }}
                >
                  <View
                    style={{
                      width: s(48),
                      height: s(48),
                      borderRadius: s(14),
                      backgroundColor: Colors.white,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: Colors.borderLight,
                    }}
                  >
                    <Feather name="image" size={s(18)} color={Colors.textMuted} />
                  </View>
                  <Text
                    style={{
                      fontSize: fontSize.small,
                      fontWeight: '600',
                      color: Colors.textTertiary,
                    }}
                  >
                    No cover photo
                  </Text>
                </View>
              )}
              {/* Status pill */}
              <View
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  backgroundColor: item.isOpen ? '#DBEAFE' : 'rgba(15,15,15,0.75)',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: item.isOpen ? '#BFDBFE' : 'rgba(255,255,255,0.25)',
                }}
              >
                <View
                  style={{
                    width: s(6),
                    height: s(6),
                    borderRadius: s(3),
                    backgroundColor: item.isOpen ? '#3B82F6' : Colors.white,
                  }}
                />
                <Text
                  style={{
                    fontSize: fontSize.tiny,
                    fontWeight: '700',
                    color: item.isOpen ? '#1E40AF' : Colors.white,
                  }}
                >
                  {item.isOpen ? 'OPEN' : 'CLOSED'}
                </Text>
              </View>
            </View>

            {/* ── Info container ── */}
            {/* 
              FIX: Reduced negative margin from -24 to -12 and added paddingTop
              to push the title down so it doesn't touch the banner.
            */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                paddingTop: spacing.md, // extra top padding
                marginTop: -s(12), // less overlap
              }}
            >
              {/* Logo */}
              <View
                style={{
                  width: s(56),
                  height: s(56),
                  borderRadius: s(16),
                  backgroundColor: Colors.white,
                  borderWidth: 2,
                  borderColor: Colors.white,
                  ...Shadow.sm,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.logoUrl ? (
                  <Image
                    source={{ uri: item.logoUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: fontSize.large,
                      fontWeight: '800',
                      color: Colors.primary,
                    }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              {/* Details */}
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    minWidth: 0,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: fontSize.medium,
                      fontWeight: '800',
                      color: Colors.textDark,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: Colors.primaryBg,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: Radius.full,
                      borderWidth: 1,
                      borderColor: '#FECDD3',
                      flexShrink: 0,
                    }}
                  >
                    <Feather name="star" size={s(11)} color={Colors.primary} />
                    <Text
                      style={{
                        fontSize: fontSize.small,
                        fontWeight: '700',
                        color: Colors.primary,
                      }}
                    >
                      {item.averageRating ? Number(item.averageRating).toFixed(1) : 'New'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: fontSize.small,
                    color: Colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.cuisineType} • {item.address}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    marginTop: spacing.xs,
                    flexWrap: 'wrap',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      flexShrink: 0,
                    }}
                  >
                    <Feather name="clock" size={s(11)} color={Colors.textTertiary} />
                    <Text style={{ fontSize: fontSize.small, color: Colors.textTertiary }}>
                      {item.openingTime?.slice(0, 5) || '--:--'} –{' '}
                      {item.closingTime?.slice(0, 5) || '--:--'}
                    </Text>
                  </View>

                  {item.isVerified ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        backgroundColor: '#DCFCE7',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: Radius.full,
                        borderWidth: 1,
                        borderColor: '#BBF7D0',
                      }}
                    >
                      <Feather name="shield" size={s(10)} color="#15803D" />
                      <Text
                        style={{
                          fontSize: fontSize.tiny,
                          fontWeight: '700',
                          color: '#15803D',
                        }}
                      >
                        Verified
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: Colors.backgroundAlt,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: Radius.full,
                        borderWidth: 1,
                        borderColor: Colors.borderLight,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fontSize.tiny,
                          fontWeight: '700',
                          color: Colors.textTertiary,
                        }}
                      >
                        Pending
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Feather
                name="chevron-right"
                size={s(16)}
                color={Colors.textTertiary}
                style={{ marginLeft: spacing.xs }}
              />
            </View>
          </PremiumCard>
        )}
      />
    </View>
  );
}