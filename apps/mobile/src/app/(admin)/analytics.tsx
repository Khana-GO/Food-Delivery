import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router'; 
import { Feather } from '@expo/vector-icons';
import { usePlatformMetrics } from '@/hooks/admin/usePlatformMetrics';
import { useRestaurantAnalytics } from '@/hooks/admin/useRestaurantAnalytics';
import { useDriverAnalytics } from '@/hooks/admin/useDriverAnalytics';
import { RevenueTrendChart } from '@/components/admin/analytics/RevenueTrendChart';
import { TopRestaurantsList } from '@/components/admin/analytics/TopRestaurantsList';
import { TopDriversList } from '@/components/admin/analytics/TopDriversList';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

const tabs = ['Platform', 'Restaurants', 'Drivers'];

export default function AdminAnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('Platform');
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderPlatformTab = () => {
    if (!platformMetrics) return null;

    const metrics = [
      { label: 'Total Orders', value: platformMetrics.totalOrders, icon: 'shopping-bag' as const, color: Colors.primary, change: platformMetrics.growth.orders, bg: Colors.primaryBg },
      { label: 'Total Revenue', value: `Rs. ${platformMetrics.totalRevenue.toLocaleString()}`, icon: 'dollar-sign' as const, color: Colors.success, change: platformMetrics.growth.revenue, bg: Colors.successBg, isRupee: true },
      { label: 'Active Users', value: platformMetrics.totalUsers, icon: 'users' as const, color: '#2563EB', bg: '#EFF6FF' },
      { label: 'Restaurants', value: platformMetrics.totalRestaurants, icon: 'home' as const, color: '#8B5CF6', bg: '#F5F3FF' },
      { label: 'Drivers', value: platformMetrics.totalDrivers, icon: 'truck' as const, color: '#D97706', bg: '#FFFBEB' },
      { label: "Today's Orders", value: platformMetrics.ordersToday, icon: 'clock' as const, color: Colors.primary, bg: Colors.primaryBg },
    ];

    return (
      <View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: Colors.white,
                borderRadius: Radius.xl,
                padding: 12,
                borderWidth: 1,
                borderColor: Colors.borderLight,
                ...Shadow.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: metric.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${metric.color}20` }}>
                  { (metric as any).isRupee ? <Text style={{ fontSize: 13, fontWeight: '800', color: metric.color }}>₹</Text> : <Feather name={metric.icon} size={14} color={metric.color} /> }
                </View>
                {metric.change !== undefined && (
                  <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: metric.change >= 0 ? Colors.successBg : Colors.errorBg, borderWidth: 1, borderColor: metric.change >= 0 ? '#BBF7D0' : '#FECDD3' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: metric.change >= 0 ? Colors.success : Colors.error }}>
                      {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.textDark }} numberOfLines={1}>{metric.value}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 14 }}>
          <PremiumCard elevation="sm" padding={14}>
            <RevenueTrendChart data={platformMetrics.orderTrend} />
          </PremiumCard>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="calendar" size={14} color={Colors.primary} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginTop: 8 }}>This Week Revenue</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 3 }}>Rs. {platformMetrics.revenueThisWeek.toLocaleString()}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="trending-up" size={14} color="#8B5CF6" />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginTop: 8 }}>This Month Orders</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 3 }}>{platformMetrics.ordersThisMonth}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRestaurantsTab = () => (
    <View>
      <PremiumCard elevation="sm" padding={14}>
        <TopRestaurantsList data={restaurantAnalytics} title="Top Restaurants by Orders" />
      </PremiumCard>
      <TouchableOpacity
        onPress={() => router.push('/(admin)/restaurants' as any)}
        style={{ marginTop: 12, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center', ...Shadow.primary }}
        activeOpacity={0.8}
      >
        <Text style={{ fontWeight: '700', color: Colors.white, fontSize: 13 }}>View All Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDriversTab = () => (
    <View>
      <PremiumCard elevation="sm" padding={14}>
        <TopDriversList data={driverAnalytics} title="Top Drivers by Deliveries" />
      </PremiumCard>
      <TouchableOpacity
        onPress={() => router.push('/(admin)/drivers' as any)}
        style={{ marginTop: 12, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center', ...Shadow.primary }}
        activeOpacity={0.8}
      >
        <Text style={{ fontWeight: '700', color: Colors.white, fontSize: 13 }}>View All Drivers</Text>
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Ultra-compact crimson header with back button */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 36,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={16} color={Colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 }}>PLATFORM INSIGHTS</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 1 }}>Analytics</Text>
            </View>
          </View>

          {/* Tabs ultra-compact */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {tabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: Radius.full,
                    backgroundColor: active ? Colors.white : 'rgba(255,255,255,0.18)',
                    borderWidth: 1,
                    borderColor: active ? Colors.white : 'rgba(255,255,255,0.25)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: active ? Colors.primary : Colors.white }}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Metrics summary ultra-compact */}
          {platformMetrics && activeTab === 'Platform' && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white }}>₹</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white, marginTop: 3 }} numberOfLines={1}>Rs. {platformMetrics.totalRevenue.toLocaleString().slice(0, 8)}</Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Revenue</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Feather name="shopping-bag" size={12} color={Colors.white} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white, marginTop: 3 }}>{platformMetrics.totalOrders}</Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Orders</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 8, alignItems: 'center', ...Shadow.sm }}>
                <Feather name="users" size={12} color={Colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.textDark, marginTop: 3 }}>{platformMetrics.totalUsers}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSecondary, marginTop: 1 }}>Users</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
}