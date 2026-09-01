import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  change?: number;
  subtitle?: string;
}

export const MetricCard = ({ label, value, icon, color, change, subtitle }: MetricCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex-1 min-w-[45%]">
      <View className="flex-row items-center justify-between">
        <View className="items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${color}15` }}>
          <Feather name={icon} size={18} color={color} />
        </View>
        {change !== undefined && (
          <View className={`px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <Text className={`text-xs font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="mt-2 text-2xl font-bold text-black">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
      {subtitle && <Text className="text-[10px] text-gray-400 mt-0.5">{subtitle}</Text>}
    </View>
  );
};