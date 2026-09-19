import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { useAdminRestaurant } from '@/hooks/admin/restaurant/useAdminRestaurant';
import { useUpdateRestaurant } from '@/hooks/admin/restaurant/useUpdateRestaurant';
import { RestaurantForm } from '@/components/res-owner/restaurant/RestaurantForm';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function EditRestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useAdminRestaurant(id);
  const { mutate: updateRestaurant, isPending } = useUpdateRestaurant();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: Colors.background }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
          <Feather name="package" size={32} color={Colors.primary} />
        </View>
        <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.textDark }}>Restaurant Not Found</Text>
        <TouchableOpacity onPress={() => goBack('/(admin)/(tabs)/restaurants')} style={{ marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.full }} activeOpacity={0.7}>
          <Text style={{ fontWeight: '700', color: Colors.white }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: 40,
          paddingBottom: 18,
          paddingHorizontal: 16,
          borderBottomLeftRadius: Radius['3xl'],
          borderBottomRightRadius: Radius['3xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => goBack('/(admin)/(tabs)/restaurants')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={16} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '800', textAlign: 'right' }}>Edit Restaurant</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1, textAlign: 'right' }} numberOfLines={1}>{(restaurant as any).name}</Text>
          </View>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="edit-2" size={15} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <PremiumCard elevation="md" padding={16}>
            <RestaurantForm
              initialData={restaurant as any}
              onSubmit={(data) => updateRestaurant({ id, data })}
              isLoading={isPending}
              submitLabel="Update Restaurant"
            />
          </PremiumCard>
        </View>
      </ScrollView>
    </View>
  );
}
