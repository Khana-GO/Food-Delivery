import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import {
  Field,
  PrimaryButton,
  ContentWidth,
  useResponsive,
  GREEN,
  Toggle,
} from '@/components/res-owner/owner/kit';

export interface MenuItemFormValues {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isAvailable: boolean;
}

interface MenuFormProps {
  initial?: Partial<MenuItemFormValues>;
  categories: Array<{ id: string; name: string }>;
  submitLabel: string;
  onSubmit: (values: MenuItemFormValues, image?: { uri: string }) => Promise<void>;
}

export function MenuForm({ initial, categories, submitLabel, onSubmit }: MenuFormProps) {
  const { isTablet } = useResponsive();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    categoryId: initial?.categoryId ?? '',
    isAvailable: initial?.isAvailable ?? true,
  });
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // keep full image
      quality: 0.9,
      exif: false,
      selectionLimit: 1,
    });
    if (!result.canceled) setImage({ uri: result.assets[0].uri });
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Item name is required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      e.price = 'Enter a valid price';
    if (!form.categoryId) e.categoryId = 'Pick a category';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await onSubmit(
        { ...form, price: String(parseFloat(form.price)) },
        image || undefined
      );
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err?: string) =>
    `rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 ${
      err ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: 16 }, ContentWidth(isTablet ? 640 : 9999)]}
    >
      {/* ─── Photo picker — show full image with contain ─── */}
      <Pressable
        onPress={pickImage}
        className="mb-5 h-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-green-300 bg-green-50/60 active:bg-green-50"
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" transition={200} cachePolicy="memory-disk" />
        ) : (
          <View className="items-center px-6">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <Feather name="camera" size={20} color={GREEN} />
            </View>
            <Text className="mt-2 text-sm font-semibold text-gray-700">Upload dish photo</Text>
            <Text className="mt-1 text-xs text-center text-gray-400">Full image preserved • High quality • PNG or JPG</Text>
          </View>
        )}
        {image && (
          <View className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1">
            <Text className="text-xs font-bold text-white">Change</Text>
          </View>
        )}
      </Pressable>
      {image && (
        <Pressable onPress={() => setImage(null)} className="self-end mb-3 px-3 py-1 rounded-full bg-red-50 border border-red-100">
          <Text className="text-xs font-semibold text-red-600">Remove</Text>
        </Pressable>
      )}

      {/* ─── Basics ─── */}
      <Field label="Item Name" required error={errors.name}>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={inputCls(errors.name)}
          placeholder="e.g., Chicken Momo"
          placeholderTextColor="#94A3B8"
          value={form.name}
          onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
        />
      </Field>

      <Field label="Description">
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`${inputCls()} min-h-[88px]`}
          placeholder="Short, tasty description customers will read…"
          placeholderTextColor="#94A3B8"
          value={form.description}
          onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
          multiline
          textAlignVertical="top"
        />
      </Field>

      <Field label="Price (Rs.)" required error={errors.price}>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={inputCls(errors.price)}
          placeholder="e.g., 299"
          placeholderTextColor="#94A3B8"
          value={form.price}
          onChangeText={(t) => setForm((p) => ({ ...p, price: t.replace(/[^0-9.]/g, '') }))}
          keyboardType="decimal-pad"
        />
      </Field>

      {/* ─── Category chips ─── */}
      <Field label="Category" required error={errors.categoryId}>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => {
            const active = form.categoryId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setForm((p) => ({ ...p, categoryId: c.id }))}
                className={`rounded-full px-4 py-2 ${
                  active ? 'bg-primary' : 'border border-gray-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      {/* ─── Availability ─── */}
      <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-bold text-gray-900">Available now</Text>
          <Text className="mt-0.5 text-xs leading-4 text-gray-400">
            {form.isAvailable
              ? 'Customers can order this item right away.'
              : 'Hidden from customers until you turn this on.'}
          </Text>
        </View>
        <Toggle
          checked={form.isAvailable}
          onChange={(v) => setForm((p) => ({ ...p, isAvailable: v }))}
          loading={saving}
        />
      </View>

      <PrimaryButton label={submitLabel} icon="check" variant="green" loading={saving} onPress={submit} />

      <View className="h-8" />
    </ScrollView>
  );
}
