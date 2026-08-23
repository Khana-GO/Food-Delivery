import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  StatCard,
  SectionHeader,
  ContentWidth,
  useResponsive,
  rs,
  GREEN,
} from '@/components/owner/kit';

type Range = 'week' | 'month' | 'year';

const DATASETS: Record<Range, Array<{ day: string; orders: number; revenue: number }>> = {
  week: [
    { day: 'Mon', orders: 45, revenue: 12500 },
    { day: 'Tue', orders: 52, revenue: 14800 },
    { day: 'Wed', orders: 38, revenue: 10200 },
    { day: 'Thu', orders: 60, revenue: 16800 },
    { day: 'Fri', orders: 55, revenue: 15200 },
    { day: 'Sat', orders: 70, revenue: 19500 },
    { day: 'Sun', orders: 48, revenue: 13200 },
  ],
  month: [
    { day: 'Wk 1', orders: 210, revenue: 58200 },
    { day: 'Wk 2', orders: 245, revenue: 66800 },
    { day: 'Wk 3', orders: 198, revenue: 54100 },
    { day: 'Wk 4', orders: 262, revenue: 72400 },
  ],
  year: [
    { day: 'Q1', orders: 2340, revenue: 642000 },
    { day: 'Q2', orders: 2610, revenue: 718000 },
    { day: 'Q3', orders: 2890, revenue: 795000 },
    { day: 'Q4', orders: 3120, revenue: 861000 },
  ],
};

const RANGES: Array<{ key: Range; label: string }> = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const TOP_ITEMS = [
  { name: 'Chicken Momo', sold: 342, price: 299 },
  { name: 'Pizza Margherita', sold: 289, price: 450 },
  { name: 'Chicken Biryani', sold: 254, price: 449 },
  { name: 'Garlic Naan', sold: 198, price: 99 },
];

const MEDALS = ['bg-amber-100', 'bg-slate-200', 'bg-orange-100'];

const maxRevenueOf = (data: Array<{ revenue: number }>) => Math.max(...data.map((d) => d.revenue));

export default function AnalyticsScreen() {
  const [range, setRange] = useState<Range>('week');
  const { isTablet } = useResponsive();

  const data = DATASETS[range];
  const maxOrders = useMemo(() => Math.max(...data.map((d) => d.orders)), [data]);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const avgOrder = Math.round(totalRevenue / totalOrders);
  const bestDay = useMemo(() => data.reduce((a, b) => (b.orders > a.orders ? b : a)), [data]);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Analytics" subtitle="Understand what's cooking" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 820 : 9999)]}
      >
        {/* ─── Range switch ─── */}
        <View className="self-center flex-row rounded-2xl border border-gray-100 bg-white p-1">
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRange(r.key)}
                className={`rounded-xl px-6 py-2 ${active ? 'bg-primary' : ''}`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500'}`}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ─── KPI grid ─── */}
        <View className="mt-5 flex-row flex-wrap justify-center gap-3">
          {[
            { label: 'Total Orders', value: totalOrders.toLocaleString('en-IN'), trend: '+12%', tone: 'brand' as const, icon: 'shopping-bag' as const },
            { label: 'Total Revenue', value: rs(totalRevenue), trend: '+18%', tone: 'green' as const, icon: 'trending-up' as const },
            { label: 'Avg Order Value', value: rs(avgOrder), trend: '+5%', tone: 'green' as const, icon: 'dollar-sign' as const },
            { label: 'Customer Rating', value: '4.8', trend: '+0.2', tone: 'brand' as const, icon: 'star' as const },
          ].map((s) => (
            <View
              key={s.label}
              style={{ width: isTablet ? undefined : '47.5%', flexGrow: 1 }}
              className="min-w-[160px] grow"
            >
              <StatCard icon={s.icon} label={s.label} value={s.value} trend={s.trend} tone={s.tone} />
            </View>
          ))}
        </View>

        {/* ─── Chart ─── */}
        <View className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold text-gray-900">Performance</Text>
              <Text className="text-xs text-gray-400">
                Peak: {bestDay.day} · {bestDay.orders} orders
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-green-50">
              <Feather name="bar-chart-2" size={17} color={GREEN} />
            </View>
          </View>

          {/* dual-series bars */}
          <View className="mt-5 flex-row items-end justify-between gap-2" style={{ height: 176 }}>
            {data.map((d) => (
              <View key={d.day} className="flex-1 items-center">
                <View className="h-36 w-full flex-row items-end justify-center gap-1.5">
                  <View
                    className="w-3 rounded-t-md bg-primary"
                    style={{ height: `${Math.max(12, (d.orders / maxOrders) * 100)}%` }}
                  />
                  <View
                    className="w-3 rounded-t-md bg-green-500"
                    style={{ height: `${Math.max(10, (d.revenue / maxRevenueOf(data)) * 100)}%` }}
                  />
                </View>
                <Text className="mt-2 text-[10px] font-semibold text-gray-400">{d.day}</Text>
              </View>
            ))}
          </View>

          {/* legend */}
          <View className="mt-4 flex-row items-center gap-5 border-t border-gray-50 pt-4">
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded bg-primary" />
              <Text className="text-xs font-medium text-gray-500">Orders</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded bg-green-500" />
              <Text className="text-xs font-medium text-gray-500">Revenue</Text>
            </View>
          </View>
        </View>

        {/* ─── Top items ─── */}
        <View className="mb-8 mt-5">
          <SectionHeader title="Top Selling Items" />
          <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
            {TOP_ITEMS.map((item, i) => (
              <View
                key={item.name}
                className={`flex-row items-center px-4 py-3.5 ${
                  i !== TOP_ITEMS.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className={`h-8 w-8 items-center justify-center rounded-lg ${MEDALS[i] ?? 'bg-gray-100'}`}>
                  <Text className="text-xs font-extrabold text-gray-600">#{i + 1}</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                  <Text className="mt-0.5 text-xs text-gray-400">{item.sold} sold</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-extrabold text-green-600">{rs(item.price)}</Text>
                  <Text className="text-[11px] text-gray-400">each</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
