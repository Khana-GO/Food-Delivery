import React from 'react';
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
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const { data: restaurants, isLoading, refetch } = useMyRestaurants();

  // ─── Stats ───
  const stats = [
    {
      id: '1',
      label: 'Total Restaurants',
      value: restaurants?.length || 0,
      icon: 'store',
      color: '#E23744',
      bgColor: '#FEE2E2',
    },
    {
      id: '2',
      label: 'Total Orders',
      value: 24,
      icon: 'shopping-bag',
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
      label: 'Total Revenue',
      value: 'Rs. 12,450',
      icon: 'dollar-sign',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
  ];

  // ─── Quick Actions ───
  const quickActions = [
    {
      id: '1',
      label: 'Add Restaurant',
      icon: 'plus',
      route: '/(restaurant)/restaurant/create',
      color: '#E23744',
    },
    {
      id: '2',
      label: 'Add Menu Item',
      icon: 'menu',
      route: '/(restaurant)/menu/create',
      color: '#16A34A',
    },
    {
      id: '3',
      label: 'View Orders',
      icon: 'shopping-bag',
      route: '/(restaurant)/orders/index',
      color: '#F59E0B',
    },
    {
      id: '4',
      label: 'Analytics',
      icon: 'bar-chart-2',
      route: '/(restaurant)/analytics',
      color: '#8B5CF6',
    },
  ];

  // ─── Recent Orders ───
  const recentOrders = [
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
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      case 'preparing':
        return 'bg-blue-100 text-blue-600';
      case 'ready':
        return 'bg-green-100 text-green-600';
      case 'delivered':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* ─── Header ─── */}
        <View className="px-6 pt-12 pb-6 bg-primary">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white/80">Good Morning,</Text>
              <Text className="text-2xl font-bold text-white">
                {user?.firstName || 'Restaurant Owner'}!
              </Text>
              <Text className="mt-1 text-xs text-white/70">
                Welcome back to your dashboard
              </Text>
            </View>
            <TouchableOpacity
              className="items-center justify-center w-10 h-10 rounded-full bg-white/20"
              onPress={() => router.push('/(restaurant)/notifications' as any)}
            >
              <Feather name="bell" size={20} color="#FFF" />
              <View className="w-2.5 h-2.5 rounded-full bg-red-500 absolute top-1.5 right-1.5 border border-primary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Stats Grid ─── */}
        <View className="flex-row flex-wrap gap-3 px-4 -mt-4">
          {stats.map((stat) => (
            <View
              key={stat.id}
              className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100"
              style={{ width: (width - 44) / 2 }}
            >
              <View className="flex-row items-center justify-between">
                <View
                  className="items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Feather name={stat.icon} size={18} color={stat.color} />
                </View>
              </View>
              <Text className="mt-3 text-xl font-bold text-black">{stat.value}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── Quick Actions ─── */}
        <View className="px-4 mt-4">
          <Text className="mb-3 text-base font-bold text-black">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="flex-1 min-w-[45%] bg-white rounded-xl p-4 items-center border border-gray-100 shadow-sm"
                onPress={() => router.push(action.route as any)}
              >
                <View
                  className="items-center justify-center w-12 h-12 rounded-full"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <Feather name={action.icon} size={22} color={action.color} />
                </View>
                <Text className="mt-2 text-xs font-semibold text-center text-black">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── My Restaurants ─── */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-black">My Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/(restaurant)/restaurant/index' as any)}>
              <Text className="text-sm font-semibold text-primary">See all</Text>
            </TouchableOpacity>
          </View>

          {restaurants && restaurants.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {restaurants.slice(0, 2).map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  className="flex-1 min-w-[45%] bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  onPress={() => router.push(`/(restaurant)/restaurant/${restaurant.id}` as any)}
                >
                  <View className="items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                    {restaurant.logoUrl ? (
                      <Image source={{ uri: restaurant.logoUrl }} className="w-full h-full rounded-xl" />
                    ) : (
                      <Text className="text-2xl font-bold text-primary">
                        {restaurant.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <Text className="mt-2 text-sm font-bold text-black">{restaurant.name}</Text>
                  <Text className="text-xs text-gray-500">{restaurant.cuisineType}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <View className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className={`text-xs ${restaurant.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center p-8 bg-white border border-gray-100 rounded-xl">
              <Feather name="store" size={48} color="#D1D5DB" />
              <Text className="mt-2 text-sm text-center text-gray-500">
                No restaurants yet. Create your first restaurant!
              </Text>
              <TouchableOpacity
                className="px-6 py-2 mt-4 rounded-lg bg-primary"
                onPress={() => router.push('/(restaurant)/restaurant/create' as any)}
              >
                <Text className="font-semibold text-white">Create Restaurant</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ─── Recent Orders ─── */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-black">Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(restaurant)/orders/index' as any)}>
              <Text className="text-sm font-semibold text-primary">See all</Text>
            </TouchableOpacity>
          </View>

          <View className="overflow-hidden bg-white border border-gray-100 rounded-xl">
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

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}