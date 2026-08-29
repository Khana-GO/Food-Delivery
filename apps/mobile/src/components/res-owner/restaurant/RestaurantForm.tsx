import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WARD_NUMBERS, CreateRestaurantPayload, Restaurant } from '@food_delivery/types';
import { Field } from '@/components/res-owner/owner/kit';
import { useCuisines } from '@/hooks/owner/restaurant/useRestaurants';

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const NEPALI_PHONE = /^9[867]\d{8}$/;
const TIME_HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/** "09:00" -> "09:00:00", already-complete values pass through untouched. */
const normalizeTime = (value: string) =>
  TIME_HHMM.test(value.trim()) ? `${value.trim()}:00` : value.trim();

interface RestaurantFormProps {
  initialData?: Partial<Restaurant> | null;
  onSubmit: (data: CreateRestaurantPayload) => Promise<void> | void;
  isLoading: boolean;
  submitLabel?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Section card
// ──────────────────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
      <View className="flex-row items-center gap-3 border-b border-gray-50 px-4 pb-3 pt-4">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
          <Feather name={icon} size={16} color="#E23744" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-900">{title}</Text>
          {hint ? <Text className="mt-0.5 text-[11px] text-gray-400">{hint}</Text> : null}
        </View>
      </View>
      <View className="px-4 pb-1 pt-4">{children}</View>
    </View>
  );
}

const inputClass = (hasError?: string | boolean) =>
  `h-14 rounded-xl border px-4 text-[16px] font-medium text-slate-900 ${
    hasError ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
  }`;

/** Guarantees readable input text even if NativeWind classes fail to apply. */
const inputTextStyle = { fontSize: 16, color: '#0F172A' } as const;

function TextField({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
  maxLength,
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'decimal-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
  maxLength?: number;
}) {
  return (
    <Field label={label} required={required} error={error}>
      <TextInput
        className={inputClass(error)}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        selectionColor="#E23744"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={inputTextStyle}
      />
    </Field>
  );
}

/** Read-only looking field that opens a picker modal. */
function PickerTrigger({
  label,
  required,
  error,
  placeholder,
  value,
  icon,
  onPress,
}: {
  label: string;
  required?: boolean;
  error?: string;
  placeholder: string;
  value?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  return (
    <Field label={label} required={required} error={error}>
      <Pressable
        onPress={onPress}
        className={`h-14 flex-row items-center justify-between rounded-xl border px-4 active:bg-gray-100 ${
          error ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <View className="flex-row items-center">
          {icon ? (
            <View className="mr-2">
              <Feather name={icon} size={15} color="#64748B" />
            </View>
          ) : null}
          <Text
            className={`text-[16px] font-medium ${value ? 'text-slate-900' : 'text-gray-400'}`}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
        <Feather name="chevron-down" size={17} color="#94A3B8" />
      </Pressable>
    </Field>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Bottom-sheet style option modal
// ──────────────────────────────────────────────────────────────────────────

function OptionSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[70%] rounded-t-3xl bg-white pb-8"
          onPress={() => {}}
          style={{ paddingBottom: 32 }}
        >
          {/* grabber */}
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-gray-200" />
          </View>

          <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
            <Text className="text-base font-bold text-gray-900">{title}</Text>
            <Pressable hitSlop={8} onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
              <Feather name="x" size={16} color="#475569" />
            </Pressable>
          </View>
          <View className="h-px bg-gray-100" />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main form
// ──────────────────────────────────────────────────────────────────────────

export const RestaurantForm = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Create Restaurant',
}: RestaurantFormProps) => {
  const { data: cuisineOptions } = useCuisines();

  // ─── State ───
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    wardNumber: initialData?.wardNumber ? String(initialData.wardNumber) : '',
    latitude: initialData?.latitude != null ? String(initialData.latitude) : '',
    longitude: initialData?.longitude != null ? String(initialData.longitude) : '',
    cuisineType: initialData?.cuisineType || '',
    openingTime: initialData?.openingTime ? initialData.openingTime.slice(0, 5) : '',
    closingTime: initialData?.closingTime ? initialData.closingTime.slice(0, 5) : '',
    deliveryFee: initialData?.deliveryFee != null ? String(initialData.deliveryFee) : '0',
    minimumOrderAmount:
      initialData?.minimumOrderAmount != null ? String(initialData.minimumOrderAmount) : '0',
    estimatedDeliveryTime:
      initialData?.estimatedDeliveryTime != null ? String(initialData.estimatedDeliveryTime) : '',
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cuisineSheetOpen, setCuisineSheetOpen] = useState(false);
  const [wardSheetOpen, setWardSheetOpen] = useState(false);

  // ─── Handlers ───
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const updateName = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: !slugTouched && prev.name !== '' ? slugify(value) : prev.slug,
      }));
      setErrors((prev) => ({ ...prev, name: '', slug: '' }));
    },
    [slugTouched],
  );

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    const f = formData;

    if (!f.name.trim()) e.name = 'Restaurant name is required';
    else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!f.slug.trim()) e.slug = 'Slug is required';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug.trim()))
      e.slug = 'Only lowercase letters, numbers and hyphens';

    if (f.phone.trim() && !NEPALI_PHONE.test(f.phone.trim()))
      e.phone = 'Enter a valid Nepali mobile number';

    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim()))
      e.email = 'Enter a valid email address';

    if (!f.address.trim()) e.address = 'Address is required';
    else if (f.address.trim().length < 5) e.address = 'Address must be at least 5 characters';

    const lat = parseFloat(f.latitude);
    if (!f.latitude.trim()) e.latitude = 'Latitude is required';
    else if (Number.isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Between -90 and 90';

    const lng = parseFloat(f.longitude);
    if (!f.longitude.trim()) e.longitude = 'Longitude is required';
    else if (Number.isNaN(lng) || lng < -180 || lng > 180) e.longitude = 'Between -180 and 180';

    if (!f.cuisineType) e.cuisineType = 'Choose a cuisine type';

    if (f.openingTime.trim() && !TIME_HHMM.test(f.openingTime.trim()))
      e.openingTime = 'Use HH:MM format';
    if (f.closingTime.trim() && !TIME_HHMM.test(f.closingTime.trim()))
      e.closingTime = 'Use HH:MM format';

    const fee = parseFloat(f.deliveryFee);
    if (f.deliveryFee.trim() && (Number.isNaN(fee) || fee < 0 || fee > 200))
      e.deliveryFee = 'Rs. 0 – 200';

    const minOrder = parseFloat(f.minimumOrderAmount);
    if (f.minimumOrderAmount.trim() && (Number.isNaN(minOrder) || minOrder < 0))
      e.minimumOrderAmount = 'Must be 0 or more';

    const prep = parseInt(f.estimatedDeliveryTime, 10);
    if (f.estimatedDeliveryTime.trim()) {
      if (Number.isNaN(prep) || prep < 10 || prep > 120) e.estimatedDeliveryTime = '10 – 120 minutes';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const data: CreateRestaurantPayload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      address: formData.address.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      cuisineType: formData.cuisineType,
      deliveryFee: formData.deliveryFee.trim() ? parseFloat(formData.deliveryFee) : 0,
      minimumOrderAmount: formData.minimumOrderAmount.trim()
        ? parseFloat(formData.minimumOrderAmount)
        : 0,
    };

    if (formData.description.trim()) data.description = formData.description.trim();
    if (formData.phone.trim()) data.phone = formData.phone.trim();
    if (formData.email.trim()) data.email = formData.email.trim();
    if (formData.wardNumber) data.wardNumber = parseInt(formData.wardNumber, 10);
    if (formData.openingTime.trim()) data.openingTime = normalizeTime(formData.openingTime);
    if (formData.closingTime.trim()) data.closingTime = normalizeTime(formData.closingTime);
    if (formData.estimatedDeliveryTime.trim())
      data.estimatedDeliveryTime = parseInt(formData.estimatedDeliveryTime, 10);

    onSubmit(data);
  }, [formData, validate, onSubmit]);

  // ─── Render ───
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {/* ─── Basics ─── */}
        <Section icon="edit-3" title="The basics" hint="How your store appears to customers">
          <TextField
            label="Restaurant Name"
            required
            error={errors.name}
            value={formData.name}
            onChange={updateName}
            placeholder="e.g. Himalayan Spice Kitchen"
            maxLength={255}
          />

          <Field label="Web Address (slug)" required error={errors.slug}>
            <View className="flex-row items-center">
              <TextInput
                className={`h-14 flex-1 rounded-l-xl border px-4 text-[16px] font-medium text-slate-900 ${
                  errors.slug ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
                } ${slugTouched ? '' : 'opacity-70'}`}
                placeholder="himalayan-spice-kitchen"
                placeholderTextColor="#94A3B8"
                selectionColor="#E23744"
                value={formData.slug}
                onChangeText={(t) => {
                  setSlugTouched(true);
                  updateField('slug', t.toLowerCase().replace(/\s+/g, '-'));
                }}
                autoCapitalize="none"
                style={inputTextStyle}
              />
              {slugTouched ? (
                <TouchableOpacity
                  onPress={() => {
                    setSlugTouched(false);
                    setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
                  }}
                  className="h-14 items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4 active:bg-gray-200"
                >
                  <Feather name="refresh-cw" size={16} color="#64748B" />
                </TouchableOpacity>
              ) : (
                <View className="h-14 items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 px-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Auto</Text>
                </View>
              )}
            </View>
          </Field>

          <Field label="Short Description" error={errors.description}>
            <TextInput
              className={`min-h-[110px] rounded-xl border px-4 py-3 text-[16px] leading-[22px] text-slate-900 ${
                errors.description ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
              }`}
              placeholder="What makes your kitchen special?"
              placeholderTextColor="#94A3B8"
              selectionColor="#E23744"
              value={formData.description}
              onChangeText={(t) => updateField('description', t)}
              multiline
              textAlignVertical="top"
              maxLength={500}
              style={inputTextStyle}
            />
            <Text className="mt-1 text-right text-[11px] text-gray-400">
              {formData.description.length}/500
            </Text>
          </Field>
        </Section>

        {/* ─── Contact ─── */}
        <Section icon="phone" title="Contact" hint="Customers may call for order questions">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                label="Phone"
                error={errors.phone}
                value={formData.phone}
                onChange={(t) => updateField('phone', t.replace(/[^\d]/g, '').slice(0, 10))}
                placeholder="98XXXXXXXX"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <TextField
            label="Email"
            error={errors.email}
            value={formData.email}
            onChange={(t) => updateField('email', t)}
            placeholder="info@restaurant.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Section>

        {/* ─── Location ─── */}
        <Section icon="map-pin" title="Location" hint="Where riders will pick up orders">
          <TextField
            label="Street Address"
            required
            error={errors.address}
            value={formData.address}
            onChange={(t) => updateField('address', t)}
            placeholder="Bhagwati Marg, Chabahil"
            maxLength={255}
          />

          <PickerTrigger
            label="Ward Number"
            placeholder="Select ward"
            value={formData.wardNumber ? `Ward ${formData.wardNumber}` : ''}
            icon="hash"
            onPress={() => setWardSheetOpen(true)}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                label="Latitude"
                required
                error={errors.latitude}
                value={formData.latitude}
                onChange={(t) => updateField('latitude', t)}
                placeholder="27.7172"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Longitude"
                required
                error={errors.longitude}
                value={formData.longitude}
                onChange={(t) => updateField('longitude', t)}
                placeholder="85.3240"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </Section>

        {/* ─── Cuisine & hours ─── */}
        <Section icon="clock" title="Kitchen & hours" hint="Cuisine category and daily schedule">
          <PickerTrigger
            label="Cuisine Type"
            required
            error={errors.cuisineType}
            placeholder="Choose from the list"
            value={formData.cuisineType}
            icon="tag"
            onPress={() => setCuisineSheetOpen(true)}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                label="Opens At"
                error={errors.openingTime}
                value={formData.openingTime}
                onChange={(t) => updateField('openingTime', t)}
                placeholder="09:00"
                maxLength={5}
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Closes At"
                error={errors.closingTime}
                value={formData.closingTime}
                onChange={(t) => updateField('closingTime', t)}
                placeholder="22:00"
                maxLength={5}
              />
            </View>
          </View>
          {!errors.openingTime && !errors.closingTime ? (
            <Text className="-mt-1 mb-3 text-[11px] text-gray-400">24-hour format, e.g. 09:30</Text>
          ) : null}
        </Section>

        {/* ─── Delivery ─── */}
        <Section icon="truck" title="Delivery settings" hint="Fees shown at checkout">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                label="Delivery Fee (Rs.)"
                error={errors.deliveryFee}
                value={formData.deliveryFee}
                onChange={(t) => updateField('deliveryFee', t.replace(/[^\d.]/g, ''))}
                placeholder="50"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Min Order (Rs.)"
                error={errors.minimumOrderAmount}
                value={formData.minimumOrderAmount}
                onChange={(t) => updateField('minimumOrderAmount', t.replace(/[^\d.]/g, ''))}
                placeholder="200"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <TextField
            label="Avg Prep Time (min)"
            error={errors.estimatedDeliveryTime}
            value={formData.estimatedDeliveryTime}
            onChange={(t) => updateField('estimatedDeliveryTime', t.replace(/[^\d]/g, '').slice(0, 3))}
            placeholder="35"
            keyboardType="number-pad"
          />
        </Section>

        {/* ─── Submit ─── */}
        <TouchableOpacity
          className={`mb-2 mt-1 items-center justify-center rounded-2xl bg-primary py-4 active:bg-red-700 ${
            isLoading ? 'opacity-60' : ''
          }`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center">
              <Feather name="check" size={17} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-bold tracking-wide text-white">{submitLabel}</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Cuisine sheet ─── */}
      <OptionSheet
        visible={cuisineSheetOpen}
        onClose={() => setCuisineSheetOpen(false)}
        title="Cuisine Type"
      >
        <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
          {(cuisineOptions ?? []).map((option) => {
            const active = formData.cuisineType === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  updateField('cuisineType', option);
                  setCuisineSheetOpen(false);
                }}
                className={`mx-4 mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3.5 active:bg-gray-50 ${
                  active ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'
                }`}
              >
                <Text className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-800'}`}>
                  {option}
                </Text>
                {active ? <Feather name="check-circle" size={18} color="#E23744" /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </OptionSheet>

      {/* ─── Ward sheet ─── */}
      <OptionSheet
        visible={wardSheetOpen}
        onClose={() => setWardSheetOpen(false)}
        title="Ward Number"
      >
        <View className="flex-row flex-wrap gap-2 px-5 pt-3 pb-2">
          {WARD_NUMBERS.map((n) => {
            const active = formData.wardNumber === String(n);
            return (
              <TouchableOpacity
                key={n}
                onPress={() => {
                  updateField('wardNumber', String(n));
                  setWardSheetOpen(false);
                }}
                className={`min-w-[52px] flex-1 items-center rounded-xl border py-3 ${
                  active ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50 active:bg-gray-100'
                }`}
                style={{ maxWidth: '23%' }}
              >
                <Text className={`text-sm font-bold ${active ? 'text-primary' : 'text-gray-700'}`}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </OptionSheet>
    </KeyboardAvoidingView>
  );
};
