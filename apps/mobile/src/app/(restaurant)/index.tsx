import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OrderItem {
  id: string;
  customerName: string;
  address: string;
  items: string;
  totalNpr: number;
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED' | 'DECLINED';
  timeAgo: string;
  prepMinutes?: number;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'NP-9821',
    customerName: 'Aayush Shrestha',
    address: 'Durbar Marg, Kathmandu',
    items: '2x Western BBQ Burger, 1x Large Fries, 2x Coke',
    totalNpr: 1450,
    status: 'NEW',
    timeAgo: '2 mins ago',
  },
  {
    id: 'NP-9820',
    customerName: 'Sujata Thapa',
    address: 'Jhamsikhel, Lalitpur',
    items: '1x Double Angus Burger, 1x Onion Rings',
    totalNpr: 980,
    status: 'PREPARING',
    prepMinutes: 20,
    timeAgo: '12 mins ago',
  },
  {
    id: 'NP-9818',
    customerName: 'Bikash Gurung',
    address: 'Patan, Ward #4',
    items: '3x Cheese Burger Meal',
    totalNpr: 1850,
    status: 'READY',
    prepMinutes: 15,
    timeAgo: '25 mins ago',
  },
];

export default function RestaurantDashboardScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'PREPARING' | 'READY'>('ALL');
  const [selectedPrepTime, setSelectedPrepTime] = useState<number>(20);

  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'PREPARING', prepMinutes: selectedPrepTime }
          : o
      )
    );
    Alert.alert('Order Accepted 🍳', `Order #${orderId} marked as Preparing (${selectedPrepTime} mins).`);
  };

  const handleDeclineOrder = (orderId: string) => {
    Alert.alert('Decline Order', `Are you sure you want to decline Order #${orderId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () =>
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: 'DECLINED' } : o))
          ),
      },
    ]);
  };

  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'READY' } : o))
    );
    Alert.alert('Rider Notified 🛵', `Order #${orderId} is Ready for Pickup!`);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return o.status !== 'DECLINED';
    return o.status === activeTab;
  });

  const newCount = orders.filter((o) => o.status === 'NEW').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.restaurantName}>McDonald's (Durbar Marg)</Text>
          <Text style={styles.ownerRole}>Restaurant Manager Portal</Text>
        </View>

        <View style={styles.statusToggleBox}>
          <Text style={[styles.statusText, { color: isOpen ? '#166534' : '#991B1B' }]}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </Text>
          <Switch
            value={isOpen}
            onValueChange={setIsOpen}
            trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
            thumbColor={isOpen ? '#22C55E' : '#EF4444'}
          />
        </View>
      </View>

      {/* Quick Navigation Toolbar */}
      <View style={styles.toolbarScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          <TouchableOpacity style={[styles.navPill, styles.navPillActive]}>
            <Ionicons name="receipt" size={16} color="#FFFFFF" />
            <Text style={styles.navPillTextActive}>Orders ({orders.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(restaurant)/analytics')}
          >
            <Ionicons name="bar-chart" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(restaurant)/menu')}
          >
            <Ionicons name="fast-food" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(restaurant)/promotions')}
          >
            <Ionicons name="pricetag" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Promos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPill}
            onPress={() => router.push('/(restaurant)/reviews')}
          >
            <Ionicons name="star" size={16} color="#64748B" />
            <Text style={styles.navPillText}>Reviews</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Performance Metric Overview Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>Rs. 48,250</Text>
            <Text style={styles.metricLabel}>Today's Revenue</Text>
            <Text style={styles.metricTrend}>↑ +14.5% vs yesterday</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>64</Text>
            <Text style={styles.metricLabel}>Orders Today</Text>
            <Text style={styles.metricTrend}>Avg Rs. 753 / order</Text>
          </View>
        </View>

        {/* Order Status Tabs */}
        <View style={styles.tabBarContainer}>
          {(['ALL', 'NEW', 'PREPARING', 'READY'] as const).map((tab) => {
            const count =
              tab === 'NEW' ? newCount : tab === 'PREPARING' ? preparingCount : tab === 'READY' ? readyCount : null;
            const selected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, selected && styles.tabBtnSelected]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                  {tab} {count !== null ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No active orders in this status</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Top Bar */}
                <View style={styles.orderHeaderRow}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{order.id}</Text>
                    <Text style={styles.customerNameText}>{order.customerName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      order.status === 'NEW' && styles.statusBadgeNew,
                      order.status === 'PREPARING' && styles.statusBadgePrep,
                      order.status === 'READY' && styles.statusBadgeReady,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        order.status === 'NEW' && { color: '#B45309' },
                        order.status === 'PREPARING' && { color: '#0369A1' },
                        order.status === 'READY' && { color: '#15803D' },
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Items & Address */}
                <Text style={styles.itemsSummary}>{order.items}</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.addressText}>{order.address}</Text>
                  <Text style={styles.timeAgoText}>• {order.timeAgo}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.totalPriceText}>Total: Rs. {order.totalNpr}</Text>
                  {order.prepMinutes && (
                    <Text style={styles.prepTimerText}>⏳ Est. Prep: {order.prepMinutes} mins</Text>
                  )}
                </View>

                {/* Action Buttons */}
                {order.status === 'NEW' && (
                  <View style={styles.actionsBox}>
                    <Text style={styles.prepSelectorLabel}>Select Preparation Time:</Text>
                    <View style={styles.prepPillRow}>
                      {[15, 20, 30].map((mins) => (
                        <TouchableOpacity
                          key={mins}
                          style={[styles.prepPill, selectedPrepTime === mins && styles.prepPillSelected]}
                          onPress={() => setSelectedPrepTime(mins)}
                        >
                          <Text style={[styles.prepPillText, selectedPrepTime === mins && styles.prepPillTextSelected]}>
                            {mins}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDeclineOrder(order.id)}
                      >
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptOrder(order.id)}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.acceptBtnText}>Accept Order</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {order.status === 'PREPARING' && (
                  <TouchableOpacity
                    style={styles.readyBtn}
                    onPress={() => handleMarkReady(order.id)}
                  >
                    <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.readyBtnText}>Mark Order Ready for Pickup</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  ownerRole: { fontSize: 12, color: '#64748B' },
  statusToggleBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 11, fontWeight: '800' },

  toolbarScroll: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  toolbarContent: { paddingHorizontal: 16, gap: 10 },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navPillActive: { backgroundColor: '#1E293B' },
  navPillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  navPillTextActive: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  metricsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 14 },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  metricLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  metricTrend: { fontSize: 11, fontWeight: '700', color: '#166534', marginTop: 4 },

  tabBarContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 16 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnSelected: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextSelected: { color: '#FFFFFF' },

  ordersContainer: { paddingHorizontal: 16, paddingTop: 14 },
  emptyOrders: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderIdText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  customerNameText: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeNew: { backgroundColor: '#FEF3C7' },
  statusBadgePrep: { backgroundColor: '#E0F2FE' },
  statusBadgeReady: { backgroundColor: '#DCFCE7' },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  itemsSummary: { fontSize: 14, color: '#334155', fontWeight: '500', marginVertical: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  addressText: { fontSize: 12, color: '#64748B' },
  timeAgoText: { fontSize: 12, color: '#94A3B8' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalPriceText: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  prepTimerText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

  actionsBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  prepSelectorLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  prepPillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  prepPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  prepPillSelected: { backgroundColor: '#1E293B' },
  prepPillText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  prepPillTextSelected: { color: '#FFFFFF' },

  btnRow: { flexDirection: 'row', gap: 10 },
  declineBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#FEE2E2' },
  declineBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    gap: 6,
  },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  readyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  readyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
