import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';

const MOCK = [
  { id: '1', name: 'Himali Kitchen', status: 'Delivered', time: 'Today, 1:24 PM', total: 520, items: 'Chicken Momo x2, Chai x1' },
  { id: '2', name: 'Thali House', status: 'On the way', time: 'Today, 12:10 PM', total: 350, items: 'Dal Bhat Thali x1' },
];

export default function Orders() {
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track and reorder your meals</Text>
        </View>
      </SafeAreaView>

      {MOCK.length === 0 ? (
        <EmptyState icon="shopping-bag" title="No orders yet" description="Your orders will appear here. Start exploring!" actionLabel="Explore" onAction={() => router.push('/(customer)/(tabs)/explore' as any)} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
          {MOCK.map((o) => (
            <PremiumCard key={o.id} style={{ padding: 0, overflow: 'hidden' } as any}>
              <View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark }}>{o.name}</Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{o.items}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 6 }}>{o.time} • Rs. {o.total}</Text>
                </View>
                <View style={[styles.badge, o.status === 'Delivered' ? styles.badgeSuccess : styles.badgeWarn]}>
                  <Text style={[styles.badgeText, o.status === 'Delivered' ? { color: '#15803D' } : { color: '#B45309' }]}>{o.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F1F5F9' }}>
                <TouchableOpacity style={styles.action} onPress={() => router.push(`/(customer)/order/${o.id}` as any)}>
                  <Text style={styles.actionText}>View Details</Text>
                </TouchableOpacity>
                <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9' }} />
                <TouchableOpacity style={styles.action}>
                  <Text style={[styles.actionText, { color: Colors.primary }]}>Reorder</Text>
                </TouchableOpacity>
              </View>
            </PremiumCard>
          ))}

          <TouchableOpacity onPress={() => router.push('/(customer)/order-tracking/1' as any)} style={styles.trackBtn}>
            <Feather name="map-pin" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Track Live Order</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', ...Shadow.xs },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  badgeSuccess: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  badgeWarn: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.textDark,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: 4,
    ...Shadow.md,
  },
});
