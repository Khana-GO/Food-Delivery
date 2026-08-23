import React, { useState } from 'react';
import { View, TextInput, Switch, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton, Field, ContentWidth, useResponsive, GREEN } from '@/components/owner/kit';

export interface CategoryFormValues {
  name: string;
  isActive: boolean;
}

export function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<CategoryFormValues>;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}) {
  const { isTablet } = useResponsive();
  const [name, setName] = useState(initial?.name ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 640 : 9999)]}
    >
      <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
        <Field label="Category Name" required error={error}>
          <TextInput
            className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 ${
              error ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="e.g., Appetizers"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError('');
            }}
          />
        </Field>

        {/* live preview */}
        <Text className="mb-3 mt-1 text-[13px] font-semibold text-gray-700">Preview</Text>
        <View className="mb-4 flex-row items-center rounded-xl bg-gray-50 p-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-lg ${
              isActive ? 'bg-green-50' : 'bg-slate-200'
            }`}
          >
            <Feather name="grid" size={17} color={isActive ? GREEN : '#94A3B8'} />
          </View>
          <View className="ml-3">
            <Text className="text-sm font-bold text-gray-900">{name || 'Category name'}</Text>
            <Text className="text-[11px] text-gray-400">
              {isActive ? 'Visible on your menu' : 'Hidden from menu'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-2xl bg-gray-50 p-4">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-bold text-gray-900">Active status</Text>
            <Text className="mt-0.5 text-xs leading-4 text-gray-400">
              Inactive categories stay private — customers won't see them.
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View className="mt-5">
        <PrimaryButton label={submitLabel} icon="check" variant="green" loading={saving} onPress={submit} />
      </View>
      <View className="h-8" />
    </ScrollView>
  );
}
