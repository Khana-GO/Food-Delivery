import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePlatformMetrics } from '@/hooks/admin/usePlatformMetrics';
import { useRestaurantAnalytics } from '@/hooks/admin/useRestaurantAnalytics';
import { useDriverAnalytics } from '@/hooks/admin/useDriverAnalytics';
import { MetricCard } from '@/components/admin/analytics/MetricCard';
import { RevenueTrendChart } from '@/components/admin/analytics/RevenueTrendChart';
import { TopRestaurantsList } from '@/components/admin/analytics/TopRestaurantsList';
import { TopDriversList } from '@/components/admin/analytics/TopDriversList';
import { useRouter } from 'expo-router';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';

const tabs = ['Platform', 'Restaurants', 'Drivers'];

export default function AdminAnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('Platform');
  const router = useRouter();
  const { refetch: refetchPlatform, isRefetching: isRefetchingPlatform } = usePlatformMetrics();
  const { refetch: refetchRestaurants, isRefetching: isRefetchingRestaurants } = useRestaurantAnalytics(1, 5, 'totalOrders', 'DESC');
  const { refetch: refetchDrivers, isRefetching: isRefetchingDrivers } = useDriverAnalytics(1, 5, 'totalDeliveries', 'DESC');
  const { platformMetrics, restaurantAnalytics, driverAnalytics, isLoading } = useAdminAnalyticsStore();

  const isRefreshing = isRefetchingPlatform || isRefetchingRestaurants || isRefetchingDrivers;

  const handleRefresh = () => {
    refetchPlatform();
    refetchRestaurants();
    refetchDrivers();
  };

  if (isLoading && !platformMetrics) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  const renderPlatformTab = () => {
    if (!platformMetrics) return null;

    const metrics = [
      { label: 'Total Orders', value: platformMetrics.totalOrders, icon: 'shopping-bag' as const, color: '#E23744', change: platformMetrics.growth.orders },
      { label: 'Total Revenue', value: `Rs. ${platformMetrics.totalRevenue.toLocaleString()}`, icon: 'dollar-sign' as const, color: '#16A34A', change: platformMetrics.growth.revenue },
      { label: 'Active Users', value: platformMetrics.totalUsers, icon: 'users' as const, color: '#2563EB' },
      { label: 'Restaurants', value: platformMetrics.totalRestaurants, icon: 'home' as const, color: '#8B5CF6' },
      { label: 'Drivers', value: platformMetrics.totalDrivers, icon: 'truck' as const, color: '#F59E0B' },
      { label: 'Today\'s Orders', value: platformMetrics.ordersToday, icon: 'clock' as const, color: '#E23744' },
    ];

    return (
      <View>
        <View className="flex-row flex-wrap gap-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </View>

        <View className="mt-4">
          <RevenueTrendChart data={platformMetrics.orderTrend} />
        </View>

        <View className="flex-row gap-3 mt-4">
          <MetricCard
            label="This Week Revenue"
            value={`Rs. ${platformMetrics.revenueThisWeek.toLocaleString()}`}
            icon="calendar"
            color="#E23744"
          />
          <MetricCard
            label="This Month Orders"
            value={platformMetrics.ordersThisMonth}
            icon="trending-up"
            color="#8B5CF6"
          />
        </View>
      </View>
    );
  };

  const renderRestaurantsTab = () => (
    <View>
      <TopRestaurantsList data={restaurantAnalytics} title="Top Restaurants by Orders" />
      <TouchableOpacity
        className="items-center py-3 mt-4 bg-primary/10 rounded-xl"
        onPress={() => router.push('/(admin)/restaurants')}
      >
        <Text className="font-semibold text-primary">View All Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDriversTab = () => (
    <View>
      <TopDriversList data={driverAnalytics} title="Top Drivers by Deliveries" />
      <TouchableOpacity
        className="items-center py-3 mt-4 bg-primary/10 rounded-xl"
        onPress={() => router.push('/(admin)/drivers')}
      >
        <Text className="font-semibold text-primary">View All Drivers</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Platform':
        return renderPlatformTab();
      case 'Restaurants':
        return renderRestaurantsTab();
      case 'Drivers':
        return renderDriversTab();
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Analytics</Text>
        <Text className="text-sm text-gray-500">Platform insights and trends</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row gap-2 px-4 py-2 bg-white border-b border-gray-100">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`text-sm font-medium ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {renderContent()}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}