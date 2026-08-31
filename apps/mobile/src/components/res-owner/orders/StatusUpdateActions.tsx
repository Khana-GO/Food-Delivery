import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface StatusUpdateActionsProps {
  currentStatus: string;
  onUpdate: (status: string) => void;
  isPending: boolean;
}

const statusFlow: Record<string, string[]> = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['PICKED_UP'],
  PICKED_UP: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const StatusUpdateActions = ({ currentStatus, onUpdate, isPending }: StatusUpdateActionsProps) => {
  const nextStatuses = statusFlow[currentStatus] || [];

  if (nextStatuses.length === 0) {
    return (
      <View className="p-4 bg-gray-100 rounded-xl">
        <Text className="text-center text-gray-500">No further updates possible</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {nextStatuses.map((status) => (
        <TouchableOpacity
          key={status}
          className={`bg-primary rounded-xl py-4 ${isPending ? 'opacity-50' : ''}`}
          onPress={() => onUpdate(status)}
          disabled={isPending}
        >
          <Text className="text-base font-bold text-center text-white">
            {status === 'CONFIRMED' && 'Accept Order'}
            {status === 'PREPARING' && 'Start Preparing'}
            {status === 'READY' && 'Mark Ready'}
            {status === 'PICKED_UP' && 'Picked Up'}
            {status === 'DELIVERED' && 'Delivered'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};