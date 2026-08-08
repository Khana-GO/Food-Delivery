import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { NetworkBanner } from '../../components/ui/NetworkBanner';
import { EmptyState } from '../../components/ui/EmptyState';

const ORDERS = [
  {
    id: 'FD-89241',
    restaurant: "McDonald's (Durbar Marg)",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/100px-McDonald%27s_Golden_Arches.svg.png',
    items: '1x Western BBQ Cheeseburger Meal, 1x Double Angus',
    totalNpr: 1450,
    status: 'OUT_FOR_DELIVERY',
    date: 'Today, 12:30 PM',
  },
  {
    id: 'FD-71829',
    restaurant: 'KFC Nepal',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/100px-KFC_logo.svg.png',
    items: '1x 8pc Bucket, 2x Large Coleslaw',
    totalNpr: 2200,
    status: 'DELIVERED',
    date: 'Yesterday, 6:45 PM',
  },
  {
    id: 'FD-51204',
    restaurant: 'Pizza Hut Express',
    logo: 'https://upload.wikimedia.org/wikipedia/sco/d/d2/Pizza_Hut_logo.svg',
    items: '1x Large Pepperoni Lovers Pizza',
    totalNpr: 1250,
    status: 'CANCELLED',
    date: 'Oct 15, 8:00 PM',
  },
];

export default function OrdersScreen() {
  const { addItem } = useCartStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return '#22C55E';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#38BDF8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OUT_FOR_DELIVERY':
        return '🛵 Out for Delivery';
      case 'PREPARING':
        return '🍳 Kitchen Preparing';
      case 'DELIVERED':
        return '✅ Delivered';
      case 'CANCELLED':
        return '❌ Cancelled';
      default:
        return status;
    }
  };

  const handleReorder = (order: typeof ORDERS[0]) => {
    addItem({
      id: order.id + '_reorder',
      name: order.items.split(',')[0],
      price: order.totalNpr,
      restaurantId: 'mcdonalds_1',
      restaurantName: order.restaurant,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop',
    });

    router.push('/(customer)/cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NetworkBanner isOffline={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Orders</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#38BDF8']} />
        }
      >
        {ORDERS.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Orders Placed Yet"
            description="Explore Kathmandu restaurants and order your favorite meals."
            actionLabel="Explore Restaurants"
            onAction={() => router.push('/(customer)/index' as any)}
          />
        ) : (
          <View style={styles.ordersList}>
            {ORDERS.map((order) => {
              const isActive = order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING';
              return (
                <View key={order.id} style={[styles.orderCard, isActive && styles.activeOrderCard]}>
                  <View style={styles.orderHeader}>
                    <View style={styles.restaurantInfo}>
                      <View style={styles.logoCircle}>
                        <Image source={{ uri: order.logo }} style={styles.logoImg} resizeMode="contain" />
                      </View>
                      <View>
                        <Text style={styles.restaurantName}>{order.restaurant}</Text>
                        <Text style={styles.orderDate}>{order.date} • #{order.id}</Text>
                      </View>
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>

                  <View style={styles.orderDetails}>
                    <Text style={styles.itemsText}>{order.items}</Text>
                    <Text style={styles.totalText}>Rs. {order.totalNpr}</Text>
                  </View>

                  {isActive ? (
                    <TouchableOpacity
                      style={styles.trackBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/(customer)/orders/track',
                          params: { orderId: order.id },
                        } as any)
                      }
                      activeOpacity={0.85}
                    >
                      <Ionicons name="navigate" size={16} color="#FFFFFF" />
                      <Text style={styles.trackText}>Track Live Order</Text>
                    </TouchableOpacity>
                  ) : order.status === 'DELIVERED' ? (
                    <TouchableOpacity
                      style={styles.reorderBtn}
                      onPress={() => handleReorder(order)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="refresh" size={16} color="#1E293B" />
                      <Text style={styles.reorderText}>Reorder in 1-Click</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginLeft: 12 },

  ordersList: { paddingHorizontal: 16, gap: 16, paddingTop: 14 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeOrderCard: {
    borderColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  restaurantInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoImg: { width: 32, height: 32 },
  restaurantName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  orderDate: { fontSize: 12, color: '#64748B' },
  statusText: { fontSize: 12, fontWeight: '800' },

  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemsText: { fontSize: 13, color: '#475569', flex: 1, marginRight: 16 },
  totalText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  trackText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  reorderText: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
});
