import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  time: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon:React.ComponentProps<typeof Feather>['icon'];
  color: string;
  bgColor: string;
  
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // ─── Mock Data ───
  const stats: StatItem[] = [
    {
      id: '1',
      label: 'Today\'s Orders',
      value: 24,
      icon: 'shopping-bag',
      color: '#E23744',
      bgColor: '#FEE2E2',
    },
    {
      id: '2',
      label: 'Total Revenue',
      value: 'Rs. 12,450',
      icon: 'dollar-sign',
      color: '#16A34A',
      bgColor: '#DCFCE7',
    },
    {
      id: '3',
      label: 'Pending Orders',
      value: 8,
      icon: 'clock',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: '4',
      label: 'Rating',
      value: '4.8 ⭐',
      icon: 'star',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
  ];

  const recentOrders: Order[] = [
    {
      id: '1',
      customer: 'Anish Sharma',
      items: '2x Momo, 1x Thali',
      total: 840,
      time: '2 min ago',
      status: 'pending',
    },
    {
      id: '2',
      customer: 'Sita Gurung',
      items: '1x Pizza, 2x Drinks',
      total: 1260,
      time: '15 min ago',
      status: 'preparing',
    },
    {
      id: '3',
      customer: 'Ram Thapa',
      items: '3x Burger, 1x Fries',
      total: 720,
      time: '28 min ago',
      status: 'ready',
    },
    {
      id: '4',
      customer: 'Hari Lama',
      items: '1x Biryani, 1x Raita',
      total: 560,
      time: '45 min ago',
      status: 'delivered',
    },
  ];

  // ─── Handlers ───
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      case 'preparing':
        return 'bg-blue-100 text-blue-600';
      case 'ready':
        return 'bg-green-100 text-green-600';
      case 'delivered':
        return 'bg-gray-100 text-gray-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // ─── Render ───
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-primary px-6 pt-12 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">Good Morning,</Text>
              <Text className="text-white text-2xl font-bold">
                {user?.firstName || 'Restaurant'}!
              </Text>
              <Text className="text-white/70 text-xs mt-1">Welcome back to your dashboard</Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              onPress={() => router.push('/(restaurant)/notifications' as any)}
            >
              <Feather name="bell" size={20} color="#FFF" />
              <View className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-1.5 right-1.5 border border-primary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-4 -mt-4 gap-3">
          {stats.map((stat) => (
            <View
              key={stat.id}
              className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100"
              style={{ width: (width - 44) / 2 }}
            >
              <View className="flex-row items-center justify-between">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Feather name={stat.icon} size={18} color={stat.color} />
                </View>
              </View>
              <Text className="text-xl font-bold text-black mt-3">{stat.value}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-4">
          <Text className="text-base font-bold text-black mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-100 shadow-sm"
              onPress={() => router.push('/(restaurant)/menu/index' as any)}
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <Feather name="plus" size={22} color="#E23744" />
              </View>
              <Text className="text-xs font-semibold text-black mt-2 text-center">Add Menu Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-100 shadow-sm"
              onPress={() => router.push('/(restaurant)/orders/index' as any)}
            >
              <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center">
                <Feather name="clipboard" size={22} color="#F59E0B" />
              </View>
              <Text className="text-xs font-semibold text-black mt-2 text-center">View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-100 shadow-sm"
              onPress={() => router.push('/(restaurant)/restaurant/profile' as any)}
            >
              <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center">
                <Feather name="settings" size={22} color="#16A34A" />
              </View>
              <Text className="text-xs font-semibold text-black mt-2 text-center">Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-black">Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(restaurant)/orders/index' as any)}>
              <Text className="text-sm text-primary font-semibold">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {recentOrders.map((order, index) => (
              <TouchableOpacity
                key={order.id}
                className={`px-4 py-3.5 flex-row items-center ${
                  index !== recentOrders.length - 1 ? 'border-b border-gray-50' : ''
                }`}
                onPress={() => router.push(`/(restaurant)/orders/${order.id}` as any)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-black">{order.customer}</Text>
                    <Text className="text-sm font-bold text-black">Rs. {order.total}</Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-0.5">{order.items}</Text>
                  <View className="flex-row items-center gap-3 mt-1">
                    <Text className="text-xs text-gray-400">{order.time}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      <Text className={`text-[10px] font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}