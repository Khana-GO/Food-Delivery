import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Step {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  status: 'completed' | 'active' | 'pending';
  time?: string;
}

interface OrderProgressTimelineProps {
  currentStatus: string;
  estimatedDelivery?: string;
}

const statusFlow = [
  { id: 'PENDING', label: 'Order Placed', icon: 'clock' as const },
  { id: 'CONFIRMED', label: 'Confirmed', icon: 'check-circle' as const },
  { id: 'PREPARING', label: 'Preparing', icon: 'cooking' as const },
  { id: 'READY', label: 'Ready', icon: 'package' as const },
  { id: 'PICKED_UP', label: 'Picked Up', icon: 'truck' as const },
  { id: 'DELIVERED', label: 'Delivered!', icon: 'check' as const },
];

export const OrderProgressTimeline = ({
  currentStatus,
  estimatedDelivery,
}: OrderProgressTimelineProps) => {
  const currentIndex = statusFlow.findIndex((s) => s.id === currentStatus);

  const steps: Step[] = statusFlow.map((status, index) => {
    let stepStatus: 'completed' | 'active' | 'pending' = 'pending';
    if (index < currentIndex) stepStatus = 'completed';
    else if (index === currentIndex) stepStatus = 'active';

    return {
      ...status,
      status: stepStatus,
      time: index === currentIndex && estimatedDelivery ? `Est: ${new Date(estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
    };
  });

  // Only show up to delivered (or current + 1)
  const visibleSteps = steps.slice(0, currentIndex + 2);

  return (
    <View className="p-4 bg-white border border-gray-100 rounded-xl">
      <Text className="mb-4 text-sm font-bold text-black">Order Progress</Text>

      <View className="relative">
        {visibleSteps.map((step, index) => (
          <View key={step.id} className="flex-row items-start mb-3 last:mb-0">
            {/* Icon */}
            <View className="relative">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                  step.status === 'completed'
                    ? 'bg-primary border-primary'
                    : step.status === 'active'
                    ? 'bg-primary/10 border-primary'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                {step.status === 'completed' ? (
                  <Feather name="check" size={14} color="#FFF" />
                ) : (
                  <Feather
                    name={step.icon}
                    size={14}
                    color={step.status === 'active' ? '#E23744' : '#94A3B8'}
                  />
                )}
              </View>

              {/* Connector line */}
              {index < visibleSteps.length - 1 && (
                <View
                  className={`absolute top-8 left-3.5 w-0.5 h-8 ${
                    step.status === 'completed' || step.status === 'active'
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </View>

            {/* Label */}
            <View className="flex-1 ml-3">
              <Text
                className={`text-sm font-semibold ${
                  step.status === 'completed' || step.status === 'active'
                    ? 'text-black'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className="text-xs text-gray-400">{step.time}</Text>
              )}
            </View>

            {/* Status indicator */}
            {step.status === 'active' && (
              <View className="px-2 py-0.5 rounded-full bg-primary/10">
                <Text className="text-[10px] font-medium text-primary">In Progress</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};