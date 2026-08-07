import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ORDERS = [
  {
    id: '1',
    restaurant: 'McDonald\'s',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/100px-McDonald%27s_Golden_Arches.svg.png',
    items: '2x Big Mac, 1x Fries',
    total: 21.50,
    status: 'PREPARING',
    date: 'Today, 12:30 PM',
  },
  {
    id: '2',
    restaurant: 'KFC',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/100px-KFC_logo.svg.png',
    items: '1x Bucket, 2x Cola',
    total: 35.00,
    status: 'DELIVERED',
    date: 'Yesterday, 6:45 PM',
  },
  {
    id: '3',
    restaurant: 'Pizza Hut',
    logo: 'https://upload.wikimedia.org/wikipedia/sco/d/d2/Pizza_Hut_logo.svg',
    items: '1x Pepperoni Pizza',
    total: 18.99,
    status: 'CANCELLED',
    date: 'Oct 15, 8:00 PM',
  },
];

export default function OrdersScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return '#22C55E';
      case 'CANCELLED': return '#EF4444';
      default: return '#F59E0B'; // PREPARING, PENDING, etc
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Orders</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {ORDERS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {ORDERS.map((order) => (
              <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => {}}>
                <View style={styles.orderHeader}>
                  <View style={styles.restaurantInfo}>
                    <View style={styles.logoCircle}>
                      <Image source={{ uri: order.logo }} style={styles.logoImg} resizeMode="contain" />
                    </View>
                    <View>
                      <Text style={styles.restaurantName}>{order.restaurant}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>
                  </View>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
                
                <View style={styles.orderDetails}>
                  <Text style={styles.itemsText}>{order.items}</Text>
                  <Text style={styles.totalText}>${order.total.toFixed(2)}</Text>
                </View>

                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? (
                  <TouchableOpacity style={styles.trackBtn}>
                    <Text style={styles.trackText}>Track Order</Text>
                  </TouchableOpacity>
                ) : null}
                {order.status === 'DELIVERED' ? (
                  <TouchableOpacity style={styles.reorderBtn}>
                    <Text style={styles.reorderText}>Reorder</Text>
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backText: { fontSize: 15, color: '#1E293B', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#1E293B' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  
  ordersList: { paddingHorizontal: 16, gap: 16, paddingTop: 8 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  restaurantInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 36, height: 36 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  orderDate: { fontSize: 13, color: '#94A3B8' },
  statusText: { fontSize: 13, fontWeight: '700' },
  
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemsText: { fontSize: 14, color: '#64748B', flex: 1, marginRight: 16 },
  totalText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  trackBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  trackText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  
  reorderBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  reorderText: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
});
