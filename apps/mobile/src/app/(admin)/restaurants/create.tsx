import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RestaurantForm } from '@/components/res-owner/restaurant/RestaurantForm';
import { useCreateRestaurant } from '@/hooks/owner/restaurant/useCreateRestaurant';
import { Colors, Radius } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function CreateRestaurantAdminScreen() {
  const { mutate: create, isPending } = useCreateRestaurant();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 52,
          paddingBottom: 32,
          paddingHorizontal: 20,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="plus" size={18} color={Colors.white} />
          </View>
          <View>
            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800' }}>Create Restaurant</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>Admin • New venue</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16}>
            <RestaurantForm
              onSubmit={(data) => {
                // @ts-ignore admin can create via same hook (ownerId inferred from auth if ADMIN bypass missing, but keep hook)
                create(data as any, {
                  onError: (e: any) => {
                    const msg = e?.response?.data?.message || 'Failed to create restaurant';
                    Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
                  },
                  onSuccess: () => {
                    Alert.alert('Success', 'Restaurant created');
                    if (router.canGoBack()) router.back();
                    setTimeout(() => router.replace('/(admin)/(tabs)/restaurants' as any), 100);
                  },
                });
              }}
              isLoading={isPending}
              submitLabel="Create Restaurant"
            />
          </PremiumCard>
        </View>
      </ScrollView>
    </View>
  );
}
