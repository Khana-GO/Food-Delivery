import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { menuItemService } from '@/services/customer/menu-item.service';
import { useCartStore } from '@/stores/customer/cartStore';
import { Colors, Radius, Shadow } from '@/constants/theme';
import AnimatedPage from '@/components/ui/AnimatedPage';
import PremiumCard from '@/components/ui/PremiumCard';

export default function MenuItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['menuItem', id],
    queryFn: () => menuItemService.getById(id!),
    enabled: !!id,
  });
  const { items: cartItems, addItem, removeItem } = useCartStore();
  const quantity = cartItems.find((i) => i.menuItemId === id)?.quantity || 0;

  const handleAdd = () => {
    if (!item) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      restaurantId: item.restaurantId || null,
    });
  };
  const handleRemove = () => {
    if (!id) return;
    removeItem(id);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (error || !item) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Feather name="alert-circle" size={32} color={Colors.textTertiary} />
        <Text style={{ marginTop: 12, fontWeight: '700', color: Colors.textDark }}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: Colors.textDark, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full }}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAvailable = item.isAvailable !== false;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ height: 320, backgroundColor: '#FFF7ED' }}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={250} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 64 }}>🍽️</Text>
            </View>
          )}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
              <Feather name="arrow-left" size={18} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...Shadow.sm }}>
              <Feather name="heart" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </SafeAreaView>
          {!isAvailable && (
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontWeight: '700', color: Colors.textSecondary }}>Unavailable</Text>
              </View>
            </View>
          )}
        </View>

        <AnimatedPage slide delay={30} style={{ marginTop: -16, paddingHorizontal: 16 }}>
          <PremiumCard elevation="md" style={{ borderRadius: Radius['2xl'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#BBF7D0' }}>
                    <Feather name="shield" size={12} color="#15803D" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D' }}>Fresh</Text>
                  </View>
                  <View style={{ backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#FECACA' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>4.6 ★</Text>
                  </View>
                </View>
              </View>
              <View style={{ backgroundColor: Colors.textDark, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Rs. {item.price}</Text>
              </View>
            </View>

            <Text style={{ marginTop: 12, fontSize: 13, lineHeight: 20, color: Colors.textSecondary, fontWeight: '500' }}>
              {item.description || 'Freshly prepared with premium ingredients, cooked to perfection and served hot. Customize your order and add to cart.'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Feather name="clock" size={12} color={Colors.textTertiary} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary }}>20-30 min</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Feather name="award" size={12} color={Colors.textTertiary} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary }}>Verified</Text>
              </View>
            </View>
          </PremiumCard>
        </AnimatedPage>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E2E8F0', ...Shadow.lg }}>
        {quantity > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: Radius.full, padding: 4, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
              <TouchableOpacity onPress={handleRemove} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Feather name="minus" size={18} color={Colors.textDark} />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center', color: Colors.textDark }}>{quantity}</Text>
              <TouchableOpacity onPress={handleAdd} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/cart' as any)} style={{ flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', ...Shadow.primary }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>View Cart • Rs. {quantity * Number(item.price)}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleAdd} disabled={!isAvailable} style={{ backgroundColor: isAvailable ? Colors.primary : '#E2E8F0', paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: isAvailable ? 1 : 0.6, ...Shadow.primary }}>
            <Feather name="shopping-bag" size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>{isAvailable ? `Add to Cart • Rs. ${item.price}` : 'Unavailable'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
