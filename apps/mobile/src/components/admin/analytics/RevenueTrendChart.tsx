import { PlatformMetrics } from '@food_delivery/types';
import React from 'react';
import { View, Text } from 'react-native';

interface RevenueTrendChartProps {
  data: PlatformMetrics['orderTrend'];
  label?: string;
}

export const RevenueTrendChart = ({ data, label = 'Orders & Revenue Trend' }: RevenueTrendChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View className="p-4 bg-white border border-gray-100 rounded-xl">
        <Text className="mb-2 text-sm font-bold text-black">{label}</Text>
        <Text className="py-8 text-sm text-center text-gray-500">No data available</Text>
      </View>
    );
  }

  const maxOrders = Math.max(...data.map((d) => d.orders), 1);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const last7 = data.slice(-7);

  return (
    <View className="p-4 bg-white border border-gray-100 rounded-xl">
      <Text className="mb-2 text-sm font-bold text-black">{label}</Text>

      {/* Orders bars */}
      <Text className="mt-2 text-xs text-gray-500">Orders</Text>
      <View className="flex-row items-end gap-1 mt-2" style={{ height: 80 }}>
        {last7.map((d, i) => (
          <View key={i} className="flex-1 items-center">
            <View
              className="w-full rounded-t"
              style={{
                height: `${(d.orders / maxOrders) * 100}%`,
                minHeight: 4,
                backgroundColor: '#E23744',
              }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row gap-1 mt-1">
        {last7.map((d, i) => (
          <Text key={i} className="flex-1 text-center text-[8px] text-gray-400">
            {d.date.slice(5)}
          </Text>
        ))}
      </View>

      {/* Revenue bars */}
      <Text className="mt-4 text-xs text-gray-500">Revenue (Rs.)</Text>
      <View className="flex-row items-end gap-1 mt-2" style={{ height: 80 }}>
        {last7.map((d, i) => (
          <View key={i} className="flex-1 items-center">
            <View
              className="w-full rounded-t"
              style={{
                height: `${(d.revenue / maxRevenue) * 100}%`,
                minHeight: 4,
                backgroundColor: '#10B981',
              }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row gap-1 mt-1">
        {last7.map((d, i) => (
          <Text key={i} className="flex-1 text-center text-[8px] text-gray-400">
            {d.date.slice(5)}
          </Text>
        ))}
      </View>
    </View>
  );
};
