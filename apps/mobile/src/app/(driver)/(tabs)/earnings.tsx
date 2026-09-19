/* eslint-disable react-hooks/purity */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDriverEarnings } from '@/hooks/driver/useDriverEarnings';
import { useDriverOrdersHistory } from '@/hooks/driver/useDriverOrdersHistory';
import { Colors, Radius, Shadow } from '@/constants/theme';
import PremiumCard from '@/components/ui/PremiumCard';

export default function EarningsScreen() {
  const { data: earnings, isLoading, refetch } = useDriverEarnings();
  const { data: history } = useDriverOrdersHistory();

  const today = earnings?.today ?? 0;
  const week = earnings?.week ?? 0;
  const total = earnings?.total ?? 0;
  const deliveries = earnings?.deliveries ?? history?.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} tintColor={Colors.primary} />}
      >
        {/* Premium crimson header */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 46,
            paddingBottom: 22,
            paddingHorizontal: 18,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>₹</Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 }}>EARNINGS OVERVIEW</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.white, marginTop: 2 }}>Your Earnings</Text>
            </View>
          </View>

          {/* Main balance card - white on crimson */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: Colors.white,
              borderRadius: Radius['2xl'],
              padding: 14,
              ...Shadow.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="trending-up" size={12} color={Colors.success} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 }}>TOTAL EARNINGS</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>₹</Text>
                  <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textDark, letterSpacing: -1 }}>Rs. {total}</Text>
                </View>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, fontWeight: '500' }}>{deliveries} deliveries completed</Text>
              </View>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="dollar-sign" size={18} color={Colors.primary} />
              </View>
            </View>

            {/* Mini stats inside card */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
              <View style={{ flex: 1, backgroundColor: Colors.backgroundAlt, borderRadius: Radius.xl, padding: 9, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>TODAY</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 3 }}>Rs. {today}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.backgroundAlt, borderRadius: Radius.xl, padding: 9, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>THIS WEEK</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 3 }}>Rs. {week}</Text>
              </View>
            </View>
          </View>

          {/* Secondary stats row on crimson - white translucent */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
              }}
            >
              <Feather name="package" size={15} color={Colors.white} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white, marginTop: 4 }}>{deliveries}</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Deliveries</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: Radius.xl,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
              }}
            >
              <Feather name="star" size={15} color={Colors.white} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white, marginTop: 4 }}>4.8</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Rating</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.white,
                borderRadius: Radius.xl,
                padding: 10,
                alignItems: 'center',
                ...Shadow.sm,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.primary }}>₹</Text>
              <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.textDark, marginTop: 4 }} numberOfLines={1}>
                Rs. {today}
              </Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 }}>Today</Text>
            </View>
          </View>
        </View>

        {/* Recent deliveries */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>Recent Deliveries</Text>
            <View
              style={{
                backgroundColor: Colors.primaryBg,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: '#FECDD3',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>{history?.length ?? 0} total</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : !history || history.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 24 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="inbox" size={22} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textTertiary, marginTop: 10 }}>No deliveries yet</Text>
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 3, textAlign: 'center' }}>Complete your first delivery to see earnings here</Text>
            </PremiumCard>
          ) : (
            (history as any[]).slice(0, 8).map((order: any, idx: number) => (
              <View
                key={order.id || idx}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: Radius.xl,
                  padding: 10,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: Colors.borderLight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  ...Shadow.sm,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: Colors.primaryBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#FECDD3',
                  }}
                >
                  <Feather name="truck" size={15} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>
                    {order.restaurantName || `Order #${String(order.id).slice(0, 8)}`}
                  </Text>
                  <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                    {order.deliveryAddress || 'Delivery completed'} • {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>₹</Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.success }}>Rs. {order.deliveryFee ?? order.totalAmount ?? 50}</Text>
                  </View>
                  <View
                    style={{
                      marginTop: 3,
                      backgroundColor: Colors.successBg,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: Radius.full,
                      borderWidth: 1,
                      borderColor: '#BBF7D0',
                    }}
                  >
                    <Text style={{ fontSize: 8, fontWeight: '700', color: Colors.success, letterSpacing: 0.4 }}>PAID</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
