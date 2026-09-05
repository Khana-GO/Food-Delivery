import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router'; // ✅ added
import { Feather } from '@expo/vector-icons';
import { useSalesReport } from '@/hooks/admin/useSalesReport';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import { exportService } from '@/services/admin/export.service';
import { saveAndShareCsv } from '@/lib/csv-export';
import { getApiErrorMessage } from '@/lib/api-error';
import type { SalesReportPeriod } from '@food_delivery/types';

const periods: { key: SalesReportPeriod; label: string }[] = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export default function ReportsScreen() {
  const [period, setPeriod] = useState<SalesReportPeriod>('day');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  const { data: report, isLoading, refetch, isRefetching } = useSalesReport(period, date);

  const isRefreshing = isRefetching && !isLoading;

  const restaurantRows = useMemo(() => {
    if (!report?.restaurantBreakdown) return [];
    return Object.entries(report.restaurantBreakdown)
      .map(([restaurantId, s]) => ({ restaurantId, ...s }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [report]);

  const handleExportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const csv = await exportService.exportOrdersCSV({
        startDate: date,
        endDate: date,
      });
      const ok = await saveAndShareCsv(csv, `orders-${date}-${period}.csv`);
      if (!ok) {
        Alert.alert(
          'Export',
          'Export created, but sharing is not available on this device.',
        );
      }
    } catch (error) {
      Alert.alert('Export failed', getApiErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const changePeriod = (key: SalesReportPeriod) => {
    setPeriod(key);
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Crimson header with back button */}
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
          {/* 🔙 Back button + title */}
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
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 }}>
                SALES INSIGHTS
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 1 }}>Reports</Text>
            </View>
          </View>

          {/* Period selector */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {periods.map((p) => {
              const active = period === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => changePeriod(p.key)}
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
                  <Text style={{ fontSize: 10, fontWeight: '700', color: active ? Colors.primary : Colors.white }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Period summary strip */}
          {report && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>Rs. {report.totalRevenue.toLocaleString()}</Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Revenue</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: Radius.xl, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white }}>{report.totalOrders}</Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Orders</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 8, alignItems: 'center', ...Shadow.sm }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>{new Date(report.startDate).toLocaleDateString()}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSecondary, marginTop: 2 }}>Start</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : !report ? (
            <PremiumCard elevation="sm" padding={32} style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="file-text" size={28} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginTop: 12 }}>No report available</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                Pull to refresh or try another period
              </Text>
            </PremiumCard>
          ) : (
            <>
              {/* Metric cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                    <Feather name="dollar-sign" size={14} color={Colors.primary} />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.textDark }} numberOfLines={1}>Rs. {report.totalRevenue.toLocaleString()}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>Total Revenue</Text>
                </View>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                    <Feather name="shopping-bag" size={14} color={Colors.success} />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.textDark }}>{report.totalOrders}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>Total Orders</Text>
                </View>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                    <Feather name="check-circle" size={14} color={Colors.success} />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.success }}>{report.delivered}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>Delivered</Text>
                </View>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.errorBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                    <Feather name="x-circle" size={14} color={Colors.error} />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.error }}>{report.cancelled}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>Cancelled</Text>
                </View>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9D5FF' }}>
                    <Feather name="trending-up" size={14} color="#8B5CF6" />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '800', color: Colors.textDark }}>Rs. {Math.round(report.averageOrderValue).toLocaleString()}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' }}>Avg Order</Text>
                </View>
              </View>

              {/* Export button */}
              <TouchableOpacity
                onPress={handleExportCsv}
                disabled={exporting}
                activeOpacity={0.8}
                style={{
                  marginTop: 14,
                  backgroundColor: Colors.primary,
                  borderRadius: Radius.xl,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  ...Shadow.primary,
                }}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Feather name="download" size={16} color={Colors.white} />
                )}
                <Text style={{ fontWeight: '700', color: Colors.white, fontSize: 13 }}>
                  {exporting ? 'Exporting...' : 'Export Orders (CSV)'}
                </Text>
              </TouchableOpacity>

              {/* Restaurant breakdown */}
              {restaurantRows.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <PremiumCard elevation="sm" padding={14}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>Top Restaurants</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>By revenue for this period</Text>
                    <View style={{ marginTop: 12, gap: 10 }}>
                      {restaurantRows.map((row) => (
                        <View key={row.restaurantId} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>
                              {row.restaurantId}
                            </Text>
                            <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 2 }}>{row.orders} orders</Text>
                          </View>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.primary }}>
                            Rs. {row.revenue.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </PremiumCard>
                </View>
              )}

              {/* Recent orders */}
              {report.orders.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginBottom: 8 }}>
                    Recent Orders ({report.orders.length})
                  </Text>
                  {report.orders.slice(0, 10).map((order) => (
                    <View
                      key={order.id}
                      style={{
                        backgroundColor: Colors.white,
                        borderRadius: Radius.xl,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: Colors.borderLight,
                        ...Shadow.sm,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textDark }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '700',
                            color: order.orderStatus === 'DELIVERED' ? Colors.success : order.orderStatus === 'CANCELLED' ? Colors.error : Colors.primary,
                          }}
                        >
                          {order.orderStatus.replace('_', ' ')}
                        </Text>
                      </View>
                      <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary }} numberOfLines={1}>
                          {order.customerName ?? 'Customer'}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>
                          Rs. {order.totalAmount}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}