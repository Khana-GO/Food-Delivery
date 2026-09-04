import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function orderDate(o: any): Date {
  return new Date(o.deliveredAt || o.updatedAt || o.createdAt);
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useRestaurantOrders();
  const raw: any[] = (data as any)?.data ?? (data as any) ?? [];
  const [downloading, setDownloading] = useState(false);

  const computed = useMemo(() => {
    // Only delivered orders count as earnings for restaurant (or all non-cancelled? Use DELIVERED)
    const delivered = raw.filter((o: any) => (o.orderStatus || o.status)?.toUpperCase() === 'DELIVERED');
    const total = delivered.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || o.total || 0), 0);

    const todayStart = startOfDay(new Date());
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);

    const today = delivered.filter((o: any) => orderDate(o) >= todayStart).reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
    const week = delivered.filter((o: any) => orderDate(o) >= weekStart).reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);
    const month = delivered.filter((o: any) => orderDate(o) >= monthStart).reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0);

    const thisMonthTx = delivered.filter((o: any) => orderDate(o) >= monthStart).sort((a: any, b: any) => orderDate(b).getTime() - orderDate(a).getTime());

    const recent = delivered
      .slice()
      .sort((a: any, b: any) => orderDate(b).getTime() - orderDate(a).getTime())
      .slice(0, 12);

    const deliveries = delivered.length;
    return { total, today, week, month, recent, thisMonthTx, deliveries, delivered };
  }, [raw]);

  const handleDownloadStatement = useCallback(async () => {
    if (computed.thisMonthTx.length === 0) {
      Alert.alert('No data', 'No delivered orders in the last 30 days to generate statement.');
      return;
    }
    try {
      setDownloading(true);
      const rows = computed.thisMonthTx
        .map((o: any, idx: number) => {
          const d = orderDate(o).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          const amt = rs(parseFloat(o.totalAmount) || 0);
          const customer = o.customerName || o.customer || 'Customer';
          const id = `#${String(o.id).slice(0, 8).toUpperCase()}`;
          return `<tr>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px; color:#0A0A0A;">${idx + 1}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px; color:#0A0A0A;">${id}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px; color:#334155;">${customer}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px; color:#334155;">${d}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:13px; font-weight:700; color:#15803D; text-align:right;">${amt}</td>
          </tr>`;
        })
        .join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding:24px; color:#0A0A0A; }
              .header { background: #B5122A; color: #fff; padding:20px; border-radius:16px; margin-bottom:20px; }
              .meta { font-size:11px; opacity:0.85; letter-spacing:0.6px; }
              table { width:100%; border-collapse:collapse; margin-top:8px; }
              th { text-align:left; font-size:11px; letter-spacing:0.6px; color:#64748B; padding:8px 12px; border-bottom:2px solid #E8E8E8; }
              .total-box { margin-top:16px; background:#F7F7F5; border:1px solid #E8E8E8; border-radius:12px; padding:14px; display:flex; justify-content:space-between; }
              .footer { margin-top:20px; font-size:11px; color:#94A3B8; text-align:center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="display:flex; align-items:center; gap:12;">
                <div style="width:40px; height:40px; border-radius:20px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.25); font-weight:800;">₹</div>
                <div>
                  <div style="font-size:18px; font-weight:800;">KhanaGo — Earnings Statement</div>
                  <div class="meta">LAST 30 DAYS • ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

            <div style="display:flex; gap:12; margin-bottom:16px;">
              <div style="flex:1; background:#fff; border:1px solid #E8E8E8; border-radius:12px; padding:12px; text-align:center;">
                <div style="font-size:11px; color:#64748B; font-weight:700; letter-spacing:0.5px;">TOTAL (30 DAYS)</div>
                <div style="font-size:18px; font-weight:800; color:#0A0A0A; margin-top:6px;">${rs(computed.month)}</div>
              </div>
              <div style="flex:1; background:#fff; border:1px solid #E8E8E8; border-radius:12px; padding:12px; text-align:center;">
                <div style="font-size:11px; color:#64748B; font-weight:700; letter-spacing:0.5px;">DELIVERED ORDERS</div>
                <div style="font-size:18px; font-weight:800; color:#0A0A0A; margin-top:6px;">${computed.thisMonthTx.length}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="total-box">
              <span style="font-size:13px; font-weight:700; color:#334155;">Total Earnings (30 days)</span>
              <span style="font-size:16px; font-weight:800; color:#B5122A;">${rs(computed.month)}</span>
            </div>

            <div class="footer">Generated by KhanaGo Restaurant • ${new Date().toISOString().slice(0, 10)} • All amounts in NPR</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      
      // Try sharing, fallback to alert with file path
      try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, { 
            mimeType: 'application/pdf', 
            dialogTitle: 'Earnings Statement — Last 30 Days', 
            UTI: 'com.adobe.pdf' 
          });
        } else {
          Alert.alert('Statement ready', `PDF saved to: ${uri}`);
        }
      } catch (shareError) {
        // If sharing fails, at least tell user where file is
        Alert.alert('Statement ready', `PDF generated successfully! Saved to: ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Download failed', e?.message || 'Could not generate PDF.');
    } finally {
      setDownloading(false);
    }
  }, [computed]);

  const breakdown = [
    { label: 'Today', amount: computed.today, icon: 'clock' as const, sub: 'delivered today' },
    { label: 'This Week', amount: computed.week, icon: 'calendar' as const, sub: 'last 7 days' },
    { label: 'This Month', amount: computed.month, icon: 'trending-up' as const, sub: 'last 30 days' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: Colors.primary, paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: Radius['3xl'], borderBottomRightRadius: Radius['3xl'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} activeOpacity={0.7}>
            <Feather name="arrow-left" size={18} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
            <Feather name="dollar-sign" size={18} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white }}>Earnings</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>{computed.deliveries} delivered • real-time</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>Live</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={() => refetch()} tintColor={Colors.primary} />}
      >
        {/* Balance card - white */}
        <PremiumCard elevation="md" padding={20} style={{ marginTop: -0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.6 }}>TOTAL EARNINGS</Text>
            <View style={{ backgroundColor: Colors.successBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: '#BBF7D0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="trending-up" size={12} color={Colors.success} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.success }}>Delivered</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: Colors.textDark, letterSpacing: -1 }}>{rs(computed.total)}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary }}>{computed.deliveries} orders</Text>
          </View>
          <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 6 }}>Revenue from delivered orders • updates in real time</Text>

          <TouchableOpacity
            onPress={handleDownloadStatement}
            disabled={downloading}
            style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 13, paddingHorizontal: 16, borderRadius: Radius.full, ...Shadow.primary }}
            activeOpacity={0.8}
          >
            {downloading ? <ActivityIndicator size="small" color={Colors.white} /> : <Feather name="download" size={16} color={Colors.white} />}
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.white }}>{downloading ? 'Preparing...' : 'Download Statement'}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 8 }}>Includes all delivered orders from the last month</Text>
        </PremiumCard>

        {/* Breakdown */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          {breakdown.map((b) => (
            <PremiumCard key={b.label} elevation="sm" style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name={b.icon} size={14} color={Colors.primary} />
              </View>
              <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '800', color: Colors.textDark }}>{rs(b.amount)}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textDark }}>{b.label}</Text>
              <Text style={{ fontSize: 10, color: Colors.textTertiary }}>{b.sub}</Text>
            </PremiumCard>
          ))}
        </View>

        {/* Recent transactions - real */}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Recent Earnings</Text>
            <View style={{ backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FECDD3' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>{computed.recent.length} shown</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
          ) : computed.recent.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 28 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECDD3' }}>
                <Feather name="inbox" size={24} color={Colors.primary} />
              </View>
              <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '700', color: Colors.textTertiary }}>No earnings yet</Text>
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'center' }}>Deliver orders to see earnings here</Text>
            </PremiumCard>
          ) : (
            <PremiumCard elevation="sm" padding={0} style={{ overflow: 'hidden' }}>
              {computed.recent.map((t: any, i: number) => {
                const d = orderDate(t);
                const isDelivered = (t.orderStatus || t.status)?.toUpperCase() === 'DELIVERED';
                return (
                  <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i !== computed.recent.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: isDelivered ? Colors.successBg : '#FEF3C7', borderWidth: 1, borderColor: isDelivered ? '#BBF7D0' : '#FDE68A' }}>
                      <Feather name={isDelivered ? 'check-circle' : 'clock'} size={18} color={isDelivered ? Colors.success : '#D97706'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>Order #{String(t.id).slice(0, 8).toUpperCase()} • {t.customerName || t.customer || 'Customer'}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{d.toLocaleDateString()} • {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentStatus || 'PAID'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.success }}>+ {rs(parseFloat(t.totalAmount) || 0)}</Text>
                      <View style={{ marginTop: 3, backgroundColor: isDelivered ? Colors.successBg : '#FFFBEB', paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: isDelivered ? '#BBF7D0' : '#FDE68A' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: isDelivered ? Colors.success : '#92400E' }}>{(t.orderStatus || t.status || '').toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </PremiumCard>
          )}
        </View>

        <View style={{ marginTop: 16, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, borderWidth: 1, borderColor: Colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="info" size={16} color={Colors.textTertiary} />
          <Text style={{ flex: 1, fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }}>Earnings reflect delivered orders only. Delivery fees are included as per your restaurant share. Statement covers the last 30 days and can be shared or saved as PDF.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
