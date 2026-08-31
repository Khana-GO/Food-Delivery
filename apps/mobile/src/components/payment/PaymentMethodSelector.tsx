import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PaymentMethod } from '@/stores/customer/checkoutStore';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({ selected, onSelect }: PaymentMethodSelectorProps) => {
  const methods: { id: PaymentMethod; label: string; icon: any; description: string }[] = [
    { id: 'ONLINE', label: 'eSewa', icon: 'credit-card', description: 'Pay with eSewa' },
    { id: 'OFFLINE', label: 'Cash on Delivery', icon: 'dollar-sign', description: 'Pay when you receive' },
  ];

  return (
    <View className="p-4 bg-white border border-gray-100 rounded-xl">
      <Text className="mb-3 text-sm font-bold text-black">Payment Method</Text>
      {methods.map((method) => (
        <TouchableOpacity
          key={method.id}
          className={`flex-row items-center p-3 rounded-xl mb-2 border ${selected === method.id ? 'border-primary bg-primary/5' : 'border-gray-100'}`}
          onPress={() => onSelect(method.id)}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center ${selected === method.id ? 'bg-primary' : 'bg-gray-100'}`}>
            <Feather name={method.icon} size={18} color={selected === method.id ? '#FFF' : '#666'} />
          </View>
          <View className="flex-1 ml-3">
            <Text className={`text-sm font-semibold ${selected === method.id ? 'text-primary' : 'text-black'}`}>
              {method.label}
            </Text>
            <Text className="text-xs text-gray-500">{method.description}</Text>
          </View>
          {selected === method.id && <Feather name="check-circle" size={18} color="#E23744" />}
        </TouchableOpacity>
      ))}
    </View>
  );
};