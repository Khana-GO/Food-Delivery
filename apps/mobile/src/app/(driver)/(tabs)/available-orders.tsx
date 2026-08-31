import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAvailableOrders } from '@/hooks/driver/useAvailableOrders';
import { useAcceptDelivery } from '@/hooks/driver/useAcceptDelivery';
import { DeliveryCard } from '@/components/driver/DeliveryCard';
import { useDriverStore } from '@/stores/driver/driverStore';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function AvailableOrdersScreen() {
  const { data: orders, isLoading, refetch } = useAvailableOrders();
  const { mutate: acceptDelivery, isPending } = useAcceptDelivery();
  const { availableOrders } = useDriverStore();

  const displayOrders = orders || availableOrders;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: Colors.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textDark }}>Available Orders</Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
          {displayOrders?.length || 0} orders ready for pickup
        </Text>
      </View>

      <FlatList
        data={displayOrders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />}
        renderItem={({ item }) => (
          <DeliveryCard
            order={item}
            onAccept={() => acceptDelivery(item.id)}
            isAccepting={isPending}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Feather name="truck" size={64} color="#D1D5DB" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.textTertiary, marginTop: 16 }}>No Available Orders</Text>
            <Text style={{ fontSize: 14, color: Colors.textMuted, marginTop: 6 }}>Check back later for deliveries</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}