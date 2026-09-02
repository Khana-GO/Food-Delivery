import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
type Range = 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('week');
  const { data, isLoading, refetch, isRefetching } = useRestaurantOrders();
  const raw: any[] = (data as any)?.data ?? (data as any) ?? [];

  const analytics = useMemo(() => {
    const now = new Date();
    const delivered = raw.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED');
    const totalOrders = raw.length;
    const totalRevenue = delivered.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    // group data by range
    let chartData: Array<{ label: string; orders: number; revenue: number }> = [];
    if (range === 'week') {
      // last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const dayOrders = raw.filter((o: any) => {
          const cd = new Date(o.createdAt);
          return cd >= d && cd < next;
        });
        const dayDelivered = dayOrders.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED');
        const rev = dayDelivered.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
        chartData.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), orders: dayOrders.length, revenue: rev });
      }
    } else if (range === 'month') {
      // last 4 weeks
      for (let w = 3; w >= 0; w--) {
        const end = new Date();
        end.setDate(end.getDate() - w * 7);
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        const weekOrders = raw.filter((o: any) => {
          const cd = new Date(o.createdAt);
          return cd >= start && cd <= end;
        });
        const rev = weekOrders.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED').reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
        chartData.push({ label: `W${4 - w}`, orders: weekOrders.length, revenue: rev });
      }
    } else {
      // year: last 4 quarters
      for (let q = 3; q >= 0; q--) {
        const quarterStart = new Date();
        quarterStart.setMonth(quarterStart.getMonth() - q * 3 - 2);
        quarterStart.setDate(1);
        quarterStart.setHours(0, 0, 0, 0);
        const quarterEnd = new Date(quarterStart);
        quarterEnd.setMonth(quarterEnd.getMonth() + 3);
        quarterEnd.setDate(0);
        quarterEnd.setHours(23, 59, 59, 999);
        const qOrders = raw.filter((o: any) => {
          const cd = new Date(o.createdAt);
          return cd >= quarterStart && cd <= quarterEnd;
        });
        const rev = qOrders.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED').reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
        chartData.push({ label: `Q${4 - q}`, orders: qOrders.length, revenue: rev });
      }
    }

    const maxOrders = Math.max(1, ...chartData.map((d) => d.orders));
    const maxRevenue = Math.max(1, ...chartData.map((d) => d.revenue));
    const bestDay = chartData.reduce((a, b) => (b.orders > a.orders ? b : a), chartData[0] || { label: '-', orders: 0, revenue: 0 });

    // Top items from delivered orders items
    const itemMap = new Map<string, { count: number; price: number }>();
    delivered.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        const name = it.name || it.itemNameSnapshot || 'Unknown';
        const price = it.unitPrice || it.price || 0;
        const entry = itemMap.get(name) || { count: 0, price };
        entry.count += it.quantity || 1;
        entry.price = price || entry.price;
        itemMap.set(name, entry);
      });
    });
    const topItems = Array.from(itemMap.entries())
      .map(([name, v]) => ({ name, sold: v.count, price: v.price }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return { totalOrders, totalRevenue, avgOrder, chartData, maxOrders, maxRevenue, bestDay, topItems };
  }, [raw, range]);

  const RANGES: Array<{ key: Range; label: string }> = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ backgroundColor: Colors.primary, paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="arrow-left" size={18} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="bar-chart-2" size={16} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>Analytics</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Real-time • delivered revenue</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>Live</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        {/* Range switch */}
        <View style={{ alignSelf: 'center', flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.full, padding: 4, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                onPress={() => setRange(r.key)}
                style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: active ? Colors.primary : 'transparent' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? Colors.white : Colors.textSecondary }}>{r.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
        ) : (
          <>
            {/* KPI */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Total Orders', value: String(analytics.totalOrders), icon: 'shopping-bag' as const, bg: Colors.primaryBg, color: Colors.primary },
                { label: 'Total Revenue', value: rs(analytics.totalRevenue), icon: 'trending-up' as const, bg: Colors.successBg, color: Colors.success },
                { label: 'Avg Order Value', value: rs(analytics.avgOrder), icon: 'dollar-sign' as const, bg: Colors.successBg, color: Colors.success },
                { label: 'Delivered', value: String(raw.filter((o: any) => (o.orderStatus || '').toUpperCase() === 'DELIVERED').length), icon: 'check-circle' as const, bg: Colors.primaryBg, color: Colors.primary },
              ].map((s) => (
                <PremiumCard key={s.label} elevation="sm" style={{ flex: 1, minWidth: '46%', alignItems: 'center', paddingVertical: 14 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: s.color + '20' }}>
                    <Feather name={s.icon} size={14} color={s.color} />
                  </View>
                  <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '800', color: Colors.textDark }}>{s.value}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>{s.label}</Text>
                </PremiumCard>
              ))}
            </View>

            {/* Chart */}
            <PremiumCard elevation="sm" padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Performance</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>Peak: {analytics.bestDay.label} • {analytics.bestDay.orders} orders</Text>
                </View>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                  <Feather name="bar-chart-2" size={16} color={Colors.success} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 160, marginTop: 16 }}>
                {analytics.chartData.map((d) => (
                  <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ height: 120, width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
                      <View style={{ width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: Colors.primary, height: `${Math.max(8, (d.orders / analytics.maxOrders) * 100)}%` }} />
                      <View style={{ width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: Colors.success, height: `${Math.max(6, (d.revenue / analytics.maxRevenue) * 100)}%` }} />
                    </View>
                    <Text style={{ marginTop: 6, fontSize: 10, fontWeight: '600', color: Colors.textTertiary }}>{d.label}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: Colors.primary }} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Orders</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: Colors.success }} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Revenue</Text>
                </View>
              </View>
            </PremiumCard>

            {/* Top items real */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Top Selling Items</Text>
                <View style={{ backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FECDD3' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>{analytics.topItems.length} items</Text>
                </View>
              </View>
              {analytics.topItems.length === 0 ? (
                <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Feather name="inbox" size={28} color={Colors.textMuted} />
                  <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: Colors.textTertiary }}>No sales data yet</Text>
                </PremiumCard>
              ) : (
                <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
                  {analytics.topItems.map((item, i) => (
                    <View key={item.name} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i !== analytics.topItems.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
                      <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 0 ? '#FEF3C7' : i === 1 ? '#F1F5F9' : i === 2 ? '#FFEDD5' : Colors.backgroundAlt, borderWidth: 1, borderColor: i === 0 ? '#FDE68A' : Colors.borderLight }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textDark }}>#{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>{item.sold} sold</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.success }}>{rs(item.price)}</Text>
                        <Text style={{ fontSize: 11, color: Colors.textTertiary }}>each</Text>
                      </View>
                    </View>
                  ))}
                </PremiumCard>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
