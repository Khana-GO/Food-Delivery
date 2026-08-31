import React from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAdminOrderStats } from '../../../hooks/admin/order/useAdminOrderStats';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const AdminOrderStats = () => {
  const { data: stats, isLoading } = useAdminOrderStats();

  if (isLoading) {
    return <ActivityIndicator size="large" color="#E23744" className="py-8" />;
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: 'shopping-bag', color: '#E23744' },
    { label: 'Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: 'dollar-sign', color: '#16A34A' },
    { label: 'Today', value: stats.todayOrders, icon: 'clock', color: '#2563EB' },
    { label: 'Pending', value: stats.pendingOrders, icon: 'clock', color: '#F59E0B' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: 'check-circle', color: '#22C55E' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: 'x-circle', color: '#EF4444' },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {statCards.map((stat) => (
        <PremiumCard
          key={stat.label}
          elevation="sm"
          padding={14}
          style={{ width: (width - 48) / 2, flexGrow: 1, minWidth: (width - 48) / 2 } as any}
        >
          <View className="flex-row items-center justify-between">
            <View
              className="items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <Feather name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stat.color, opacity: 0.15 }} />
          </View>
          <Text style={{ marginTop: 8, fontSize: 22, fontWeight: '800', color: Colors.textDark }}>{stat.value}</Text>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Text>
        </PremiumCard>
      ))}
    </View>
  );
};