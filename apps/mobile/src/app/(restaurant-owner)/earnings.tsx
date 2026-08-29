import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  SectionHeader,
  PrimaryButton,
  ContentWidth,
  useResponsive,
  rs,
} from '@/components/res-owner/owner/kit';

const BREAKDOWN = [
  { label: 'Today', amount: 1240, icon: 'clock' as const },
  { label: 'This Week', amount: 8450, icon: 'calendar' as const },
  { label: 'This Month', amount: 32580, icon: 'trending-up' as const },
];

const TRANSACTIONS = [
  { id: '1', title: 'Order #124', sub: 'Anish Sharma · 2 min ago', amount: 450, status: 'Completed' },
  { id: '2', title: 'Order #123', sub: 'Sita Gurung · 15 min ago', amount: 320, status: 'Completed' },
  { id: '3', title: 'Order #122', sub: 'Ram Thapa · 1 hr ago', amount: 580, status: 'Pending' },
  { id: '4', title: 'Withdrawal', sub: 'NIC Asia ····4521 · 2 hrs ago', amount: -5000, status: 'Completed' },
];

export default function EarningsScreen() {
  const { isTablet } = useResponsive();
  const total = 45290;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Earnings"
        subtitle="Your money at a glance"
        right={
          <View className="flex-row items-center rounded-full bg-green-50 px-3 py-1.5">
            <Feather name="arrow-up-right" size={13} color="#16A34A" />
            <Text className="ml-1 text-xs font-bold text-green-600">+12%</Text>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 720 : 9999)]}
      >
        {/* ─── Balance card (deep green) ─── */}
        <View className="overflow-hidden rounded-3xl bg-green-800 p-6">
          <View className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />
          <View className="absolute right-10 top-10 h-20 w-20 rounded-full bg-white/10" />
          <Text className="text-[13px] font-medium text-green-100/90">Available balance</Text>
          <View className="mt-1 flex-row items-end justify-between">
            <Text className="text-4xl font-extrabold tracking-tight text-white">{rs(total)}</Text>
            <View className="mb-1 flex-row items-center rounded-full bg-white/15 px-3 py-1.5">
              <Feather name="trending-up" size={13} color="#BBF7D0" />
              <Text className="ml-1 text-xs font-bold text-green-50">+12% this month</Text>
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <Pressable className="flex-1 items-center rounded-xl bg-white py-3 active:bg-green-50">
              <Feather name="download" size={16} color="#166534" />
              <Text className="mt-1 text-xs font-bold text-green-900">Withdraw</Text>
            </Pressable>
            <Pressable className="flex-1 items-center rounded-xl bg-white/15 py-3 active:bg-white/25">
              <Feather name="file-text" size={16} color="#FFFFFF" />
              <Text className="mt-1 text-xs font-bold text-white">Statement</Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Breakdown ─── */}
        <View className="mt-4 flex-row flex-wrap justify-center gap-3">
          {BREAKDOWN.map((b) => (
            <View
              key={b.label}
              style={{ width: isTablet ? undefined : '47.5%', flexGrow: 1 }}
              className="min-w-[160px] grow rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                <Feather name={b.icon} size={16} color="#E23744" />
              </View>
              <Text className="mt-2.5 text-lg font-extrabold tracking-tight text-gray-900">{rs(b.amount)}</Text>
              <Text className="text-xs text-gray-400">{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── Transactions ─── */}
        <View className="mb-8 mt-6">
          <SectionHeader title="Recent Transactions" actionLabel="See all" onAction={() => {}} />
          <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
            {TRANSACTIONS.map((t, i) => {
              const credit = t.amount > 0;
              return (
                <View
                  key={t.id}
                  className={`flex-row items-center px-4 py-3.5 ${
                    i !== TRANSACTIONS.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      credit ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <Feather
                      name={credit ? 'plus-circle' : 'minus-circle'}
                      size={18}
                      color={credit ? '#16A34A' : '#DC2626'}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-gray-900">{t.title}</Text>
                    <Text className="mt-0.5 text-xs text-gray-400">{t.sub}</Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-sm font-extrabold ${credit ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {credit ? '+' : '-'} {rs(Math.abs(t.amount))}
                    </Text>
                    <View
                      className={`mt-0.5 rounded-full px-2 py-px ${
                        t.status === 'Completed' ? 'bg-green-50' : 'bg-amber-50'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          t.status === 'Completed' ? 'text-green-600' : 'text-amber-600'
                        }`}
                      >
                        {t.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <PrimaryButton label="Withdraw Earnings" variant="green" icon="download" onPress={() => {}} />
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
