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
            paddingTop: 52,
            paddingBottom: 28,
            paddingHorizontal: 20,
            borderBottomLeftRadius: Radius['3xl'],
            borderBottomRightRadius: Radius['3xl'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white }}>₹</Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 }}>EARNINGS OVERVIEW</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 2 }}>Your Earnings</Text>
            </View>
          </View>

          {/* Main balance card - white on crimson */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.white,
              borderRadius: Radius['2xl'],
              padding: 20,
              ...Shadow.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="trending-up" size={14} color={Colors.success} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 }}>TOTAL EARNINGS</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.primary }}>₹</Text>
                  <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.textDark, letterSpacing: -1 }}>Rs. {total}</Text>
                </View>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' }}>{deliveries} deliveries completed</Text>
              </View>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="dollar-sign" size={24} color={Colors.primary} />
              </View>
            </View>

            {/* Mini stats inside card */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
              <View style={{ flex: 1, backgroundColor: Colors.backgroundAlt, borderRadius: Radius.xl, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>TODAY</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, marginTop: 4 }}>Rs. {today}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.backgroundAlt, borderRadius: Radius.xl, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>THIS WEEK</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, marginTop: 4 }}>Rs. {week}</Text>
              </View>
            </View>
          </View>

          {/* Secondary stats row on crimson - white translucent */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: Radius.xl,
                padding: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
              }}
            >
              <Feather name="package" size={18} color={Colors.white} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 6 }}>{deliveries}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Deliveries</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: Radius.xl,
                padding: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
              }}
            >
              <Feather name="star" size={18} color={Colors.white} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 6 }}>4.8</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Rating</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.white,
                borderRadius: Radius.xl,
                padding: 14,
                alignItems: 'center',
                ...Shadow.sm,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>₹</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textDark, marginTop: 6 }} numberOfLines={1}>
                Rs. {today}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 }}>Today</Text>
            </View>
          </View>
        </View>

        {/* Recent deliveries */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>Recent Deliveries</Text>
            <View
              style={{
                backgroundColor: Colors.primaryBg,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: '#FECDD3',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>{history?.length ?? 0} total</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : !history || history.length === 0 ? (
            <PremiumCard elevation="sm" style={{ alignItems: 'center', paddingVertical: 32 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: Colors.primaryBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECDD3',
                }}
              >
                <Feather name="inbox" size={28} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textTertiary, marginTop: 12 }}>No deliveries yet</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, textAlign: 'center' }}>Complete your first delivery to see earnings here</Text>
            </PremiumCard>
          ) : (
            (history as any[]).slice(0, 8).map((order: any, idx: number) => (
              <View
                key={order.id || idx}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: Radius.xl,
                  padding: 14,
                  marginBottom: 10,
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
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: Colors.primaryBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#FECDD3',
                  }}
                >
                  <Feather name="truck" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>
                    {order.restaurantName || `Order #${String(order.id).slice(0, 8)}`}
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                    {order.deliveryAddress || 'Delivery completed'} • {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.primary }}>₹</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.success }}>Rs. {order.deliveryFee ?? order.totalAmount ?? 50}</Text>
                  </View>
                  <View
                    style={{
                      marginTop: 4,
                      backgroundColor: Colors.successBg,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: Radius.full,
                      borderWidth: 1,
                      borderColor: '#BBF7D0',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.success, letterSpacing: 0.4 }}>PAID</Text>
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
