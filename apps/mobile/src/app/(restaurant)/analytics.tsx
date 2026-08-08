import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const REVENUE_DATA = [
  { day: 'Mon', amount: 32000 },
  { day: 'Tue', amount: 38500 },
  { day: 'Wed', amount: 41200 },
  { day: 'Thu', amount: 39000 },
  { day: 'Fri', amount: 54000 },
  { day: 'Sat', amount: 62500 },
  { day: 'Sun', amount: 48250 },
];

const TOP_ITEMS = [
  { name: 'Western BBQ Cheeseburger', sales: 142, revenue: 'Rs. 94,998' },
  { name: 'Double Angus Classic', sales: 98, revenue: 'Rs. 58,702' },
  { name: 'Large French Fries', sales: 210, revenue: 'Rs. 42,000' },
];

export default function RestaurantAnalyticsScreen() {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.amount));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Sales Analytics &amp; Reports</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Period Selector Tabs */}
        <View style={styles.periodRow}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnSelected]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextSelected]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Chart Visual Bar Card */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Total Sales Revenue</Text>
              <Text style={styles.totalSalesNum}>Rs. 315,450</Text>
            </View>
            <View style={styles.growthBadge}>
              <Text style={styles.growthText}>↑ 18.2% vs last week</Text>
            </View>
          </View>

          {/* Bar Chart Visual */}
          <View style={styles.barChartContainer}>
            {REVENUE_DATA.map((item) => {
              const heightPct = (item.amount / maxRevenue) * 100;
              return (
                <View key={item.day} style={styles.barColumn}>
                  <View style={[styles.barFill, { height: `${heightPct}%` }]} />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Operational Performance</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.metricVal}>4.8 ⭐</Text>
              <Text style={styles.metricSub}>Average Rating</Text>
            </View>

            <View style={styles.metricItem}>
              <Ionicons name="timer-outline" size={20} color="#38BDF8" />
              <Text style={styles.metricVal}>18 mins</Text>
              <Text style={styles.metricSub}>Avg Prep Time</Text>
            </View>

            <View style={styles.metricItem}>
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
              <Text style={styles.metricVal}>98.5%</Text>
              <Text style={styles.metricSub}>Fulfillment Rate</Text>
            </View>
          </View>
        </View>

        {/* Peak Hours Telemetry */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Peak Order Hours</Text>
          <View style={styles.peakRow}>
            <View style={styles.peakBadge}>
              <Ionicons name="flame" size={16} color="#B45309" />
              <Text style={styles.peakText}>Lunch Rush: 12:00 PM - 2:00 PM</Text>
            </View>
            <View style={styles.peakBadge}>
              <Ionicons name="moon" size={16} color="#1D4ED8" />
              <Text style={[styles.peakText, { color: '#1D4ED8' }]}>Dinner Rush: 7:00 PM - 9:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Top Selling Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Selling Dishes</Text>
          {TOP_ITEMS.map((item, idx) => (
            <View key={idx} style={styles.topItemRow}>
              <Text style={styles.rankNum}>#{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSales}>{item.sales} orders</Text>
              </View>
              <Text style={styles.itemRevenue}>{item.revenue}</Text>
            </View>
          ))}
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginLeft: 12 },

  periodRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 14, marginBottom: 8 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  periodBtnSelected: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  periodText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  periodTextSelected: { color: '#FFFFFF' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  chartTitle: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  totalSalesNum: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  growthBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  growthText: { fontSize: 11, fontWeight: '800', color: '#166534' },

  barChartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 8, paddingTop: 10 },
  barColumn: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barFill: { width: '80%', backgroundColor: '#38BDF8', borderRadius: 6, minHeight: 8 },
  barLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 6 },

  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 14 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { flex: 1, alignItems: 'center', gap: 4 },
  metricVal: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  metricSub: { fontSize: 11, color: '#64748B' },

  peakRow: { gap: 8 },
  peakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, gap: 8 },
  peakText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  topItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  rankNum: { fontSize: 15, fontWeight: '800', color: '#38BDF8' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  itemSales: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemRevenue: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
});
