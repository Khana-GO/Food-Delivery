import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DriverStatsCardProps {
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  todayEarnings: number;
}

export const DriverStatsCard = ({
  totalDeliveries,
  totalEarnings,
  rating,
  todayEarnings,
}: DriverStatsCardProps) => {
  const stats = [
    { label: 'Deliveries', value: totalDeliveries, icon: 'truck' },
    { label: 'Total Earnings', value: `Rs. ${totalEarnings}`, icon: 'dollar-sign' },
    { label: 'Rating', value: rating.toFixed(1), icon: 'star' },
    { label: "Today's Earning", value: `Rs. ${todayEarnings}`, icon: 'clock' },
  ];

  return (
    <View className="flex-row flex-wrap gap-3 px-4 -mt-4">
      {stats.map((stat, index) => (
        <View
          key={index}
          className="flex-1 min-w-[45%] bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <View className="flex-row items-center gap-2">
            <View className="items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Feather name={stat.icon as any} size={16} color="#E23744" />
            </View>
            <Text className="text-xs text-gray-500">{stat.label}</Text>
          </View>
          <Text className="mt-1 text-lg font-bold text-black">{stat.value}</Text>
        </View>
      ))}
    </View>
  );
};