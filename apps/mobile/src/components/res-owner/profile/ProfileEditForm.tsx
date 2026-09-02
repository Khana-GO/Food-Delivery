import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { User } from '@food_delivery/types';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || /^\+?[1-9]\d{7,14}$/.test(v.trim()) || /^[0-9]{10}$/.test(v.trim()),
      { message: 'Enter a valid phone number (10 digits or +country code)' }
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: User | null;
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
}

export const ProfileEditForm = ({ user, onSubmit, isLoading }: ProfileEditFormProps) => {
  const [form, setForm] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user?.phone as string) || '',
  });
  const [errors, setErrors] = useState<Record<keyof ProfileFormData, string>>({} as any);

  // Keep form in sync if user changes externally (e.g., after refresh)
  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: (user?.phone as string) || '',
    });
  }, [user?.firstName, user?.lastName, user?.email, user?.phone]);

  const validate = () => {
    try {
      profileSchema.parse(form);
      setErrors({} as any);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as z.ZodError).issues.forEach((e: any) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof ProfileFormData] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Strip empty phone so backend doesn't validate empty string against regex
    const payload: ProfileFormData = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone?.trim() ? form.phone.trim() : undefined,
    };
    // Remove phone if empty
    if (!payload.phone) delete (payload as any).phone;
    onSubmit(payload as any);
  };

  return (
    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
      {/* First Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">First Name *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Enter first name"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
        />
        {errors.firstName && <Text className="mt-1 text-xs text-red-500">{errors.firstName}</Text>}
      </View>

      {/* Last Name */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Last Name *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Enter last name"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
        />
        {errors.lastName && <Text className="mt-1 text-xs text-red-500">{errors.lastName}</Text>}
      </View>

      {/* Email - not editable */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Email *</Text>
        <View className={`border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 bg-gray-100 flex-row items-center`}>
          <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
            className="flex-1 text-base text-gray-500"
            placeholder="Enter email"
            value={form.email}
            editable={false}
            selectTextOnFocus={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Feather name="lock" size={14} color="#94A3B8" />
        </View>
        <Text className="mt-1 text-xs text-gray-400">Email cannot be changed</Text>
        {errors.email && <Text className="mt-1 text-xs text-red-500">{errors.email}</Text>}
      </View>

      {/* Phone */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Phone</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className="px-4 py-3 text-base text-black bg-white border border-gray-200 rounded-xl"
          placeholder="Enter phone number"
          value={form.phone ?? ''}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text className="mt-1 text-xs text-red-500">{errors.phone}</Text>}
      </View>

      {/* Submit */}
      <TouchableOpacity
        className={`bg-primary rounded-xl py-4 ${isLoading ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text className="text-base font-bold text-center text-white">Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};