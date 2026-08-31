import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';

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
    <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: Colors.white,
              borderRadius: Radius.xl,
              padding: 16,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: Colors.borderLight,
              ...Shadow.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={stat.icon as any} size={15} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{stat.label}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark, marginTop: 8 }}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};