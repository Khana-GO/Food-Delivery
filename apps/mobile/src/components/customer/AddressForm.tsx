import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Address } from '@food_delivery/types';

interface AddressFormProps {
  initialData?: Partial<Address>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  submitLabel?: string;
}

export const AddressForm = ({ initialData, onSubmit, isLoading, submitLabel = 'Add Address' }: AddressFormProps) => {
  const [form, setForm] = useState({
    label: initialData?.label || 'Home',
    addressLine: initialData?.addressLine || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'Nepal',
    postalCode: initialData?.postalCode || '',
    isDefault: initialData?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
      {/* Label */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Label</Text>
        <View className="flex-row gap-2">
          {['Home', 'Office', 'Other'].map((label) => (
            <TouchableOpacity
              key={label}
              className={`px-4 py-2 rounded-lg ${form.label === label ? 'bg-primary' : 'bg-gray-200'}`}
              onPress={() => setForm({ ...form, label })}
            >
              <Text className={`text-sm font-medium ${form.label === label ? 'text-white' : 'text-gray-600'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Address Line */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Address *</Text>
        <TextInput
          className={`border ${errors.addressLine ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Street, Tole, Ward"
          value={form.addressLine}
          onChangeText={(text) => setForm({ ...form, addressLine: text })}
          multiline
        />
        {errors.addressLine && <Text className="mt-1 text-xs text-red-500">{errors.addressLine}</Text>}
      </View>

      {/* City */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">City *</Text>
        <TextInput
          className={`border ${errors.city ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Kathmandu"
          value={form.city}
          onChangeText={(text) => setForm({ ...form, city: text })}
        />
        {errors.city && <Text className="mt-1 text-xs text-red-500">{errors.city}</Text>}
      </View>

      {/* State (optional) */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">State (Optional)</Text>
        <TextInput
          className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
          placeholder="Bagmati Province"
          value={form.state}
          onChangeText={(text) => setForm({ ...form, state: text })}
        />
      </View>

      {/* Country */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Country *</Text>
        <TextInput
          className={`border ${errors.country ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Nepal"
          value={form.country}
          onChangeText={(text) => setForm({ ...form, country: text })}
        />
        {errors.country && <Text className="mt-1 text-xs text-red-500">{errors.country}</Text>}
      </View>

      {/* Postal Code */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Postal Code (Optional)</Text>
        <TextInput
          className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
          placeholder="44600"
          value={form.postalCode}
          onChangeText={(text) => setForm({ ...form, postalCode: text })}
          keyboardType="number-pad"
        />
      </View>

      {/* Default Address */}
      <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-black">Set as default</Text>
            <Text className="text-xs text-gray-500">Use this address by default for future orders</Text>
          </View>
          <Switch
            value={form.isDefault}
            onValueChange={(value) => setForm({ ...form, isDefault: value })}
            trackColor={{ false: '#D1D5DB', true: '#E23744' }}
            thumbColor={form.isDefault ? '#FFF' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        className={`bg-primary rounded-xl py-4 mb-8 ${isLoading ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text className="text-base font-bold text-center text-white">{submitLabel}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};