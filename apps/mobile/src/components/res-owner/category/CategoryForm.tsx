import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  Field,
  PrimaryButton,
  ContentWidth,
  useResponsive,
  GREEN,
} from '@/components/res-owner/owner/kit';

export interface CategoryFormValues {
  name: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Category',
}: CategoryFormProps) {
  const { isTablet } = useResponsive();
  const [name, setName] = useState(initialData?.name ?? '');
  const [error, setError] = useState('');

  // Clear stale name when returning to create screen (prevents previous data showing)
  useFocusEffect(
    React.useCallback(() => {
      if (!initialData) {
        setName('');
        setError('');
      } else {
        setName(initialData.name ?? '');
      }
    }, [initialData]),
  );

  const submit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    setError('');
    await onSubmit({ name: name.trim() });
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
            className={`rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-gray-900 ${
              error ? 'border-red-400' : 'border-gray-200'
            }`}
            placeholder="e.g., Appetizers"
            placeholderTextColor="#94A3B8"
            style={{ fontWeight: '400' }}
            value={name}
            maxLength={100}
            onChangeText={(t) => {
              setName(t);
              if (error) setError('');
            }}
          />
        </Field>

        {/* live preview */}
        <Text className="mb-3 mt-1 text-[13px] font-semibold text-gray-700">Preview</Text>
        <View className="mb-1 flex-row items-center rounded-xl bg-gray-50 p-3">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <Feather name="grid" size={17} color={GREEN} />
          </View>
          <View className="ml-3">
            <Text className="text-sm font-bold text-gray-900">
              {name.trim() || 'Category name'}
            </Text>
            <Text className="text-[11px] text-gray-400">
              Shown as a section on your menu
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-5">
        <PrimaryButton
          label={submitLabel}
          icon="check"
          variant="green"
          loading={isLoading}
          onPress={submit}
        />
      </View>
      <View className="h-8" />
    </ScrollView>
  );
}
