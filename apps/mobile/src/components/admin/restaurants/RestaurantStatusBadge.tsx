import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  isOpen?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
}

export const RestaurantStatusBadge = ({ isOpen, isActive, isVerified, isDeleted }: StatusBadgeProps) => {
  const badges: { label: string; bg: string; color: string; dot?: string }[] = [];

  if (isDeleted) {
    badges.push({ label: 'Deleted', bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626' });
  } else {
    if (isActive !== undefined) {
      badges.push({
        label: isActive ? 'Active' : 'Inactive',
        bg: isActive ? '#DCFCE7' : '#F1F5F9',
        color: isActive ? '#16A34A' : '#64748B',
        dot: isActive ? '#16A34A' : '#94A3B8',
      });
    }
    if (isVerified !== undefined) {
      badges.push({
        label: isVerified ? 'Verified' : 'Pending',
        bg: isVerified ? '#DBEAFE' : '#FFEDD5',
        color: isVerified ? '#2563EB' : '#EA580C',
        dot: isVerified ? '#2563EB' : '#F97316',
      });
    }
    if (isOpen !== undefined) {
      badges.push({
        label: isOpen ? 'Open' : 'Closed',
        bg: isOpen ? '#DCFCE7' : '#F3F4F6',
        color: isOpen ? '#16A34A' : '#6B7280',
        dot: isOpen ? '#16A34A' : '#9CA3AF',
      });
    }
  }

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {badges.map((b, i) => (
        <View
          key={i}
          className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: b.bg, borderColor: b.bg }}
        >
          {b.dot && <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.dot }} />}
          <Text className="text-[10px] font-extrabold tracking-wide" style={{ color: b.color }}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
};
