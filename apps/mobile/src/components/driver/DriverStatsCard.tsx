import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    { label: 'Deliveries', value: totalDeliveries, icon: 'truck', isRupee: false },
    { label: 'Total Earnings', value: `Rs. ${totalEarnings}`, icon: 'credit-card', isRupee: true },
    { label: 'Rating', value: rating.toFixed(1), icon: 'star', isRupee: false },
    { label: "Today's Earning", value: `Rs. ${todayEarnings}`, icon: 'clock', isRupee: true },
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                {stat.isRupee ? (
                  <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.white }}>₹</Text>
                ) : (
                  <Feather name={stat.icon as any} size={12} color={Colors.white} />
                )}
              </View>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, flexShrink: 1 }} numberOfLines={1}>{stat.label}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, marginTop: 6 }} numberOfLines={1}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};