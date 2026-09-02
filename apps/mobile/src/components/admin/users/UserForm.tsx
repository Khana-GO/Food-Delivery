import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { UserRole } from '@food_delivery/types';

interface UserFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
  };
  onSubmit: (data: any) => void;
  isLoading: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

const ROLES: UserRole[] = ['ADMIN', 'CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER'];

export const UserForm = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Create User',
  isEdit = false,
}: UserFormProps) => {
  const [form, setForm] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || ('CUSTOMER' as UserRole),
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) newErrors.firstName = 'At least 2 characters';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) newErrors.lastName = 'At least 2 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) newErrors.email = 'Invalid email';
    if (!isEdit && !form.password) newErrors.password = 'Password is required';
    if (form.password && form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)) {
      newErrors.password = 'Must include upper, lower, number & special char';
    }
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[1-9]\d{1,14}$/.test(form.phone.trim())) newErrors.phone = 'Invalid phone (+country code)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: any = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
    };
    if (!isEdit) payload.password = form.password;
    onSubmit(payload);
  };

  return (
    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">First Name *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Enter first name"
          placeholderTextColor="#94A3B8"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
        />
        {errors.firstName && <Text className="mt-1 text-xs text-red-500">{errors.firstName}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Last Name *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Enter last name"
          placeholderTextColor="#94A3B8"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
        />
        {errors.lastName && <Text className="mt-1 text-xs text-red-500">{errors.lastName}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Email *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="Enter email"
          placeholderTextColor="#94A3B8"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text className="mt-1 text-xs text-red-500">{errors.email}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Phone *</Text>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className={`border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
          placeholder="+9779800000000"
          placeholderTextColor="#94A3B8"
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text className="mt-1 text-xs text-red-500">{errors.phone}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-black mb-1.5">Role *</Text>
        <View className="flex-row flex-wrap gap-2">
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              className={`px-4 py-2 rounded-lg ${form.role === role ? 'bg-primary' : 'bg-gray-200'}`}
              onPress={() => setForm({ ...form, role })}
            >
              <Text className={`text-sm font-medium ${form.role === role ? 'text-white' : 'text-gray-600'}`}>
                {role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!isEdit && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-black mb-1.5">Password *</Text>
          <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
            className={`border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-base text-black bg-white`}
            placeholder="Password123!"
            placeholderTextColor="#94A3B8"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
          />
          {errors.password && <Text className="mt-1 text-xs text-red-500">{errors.password}</Text>}
          <Text className="mt-1 text-xs text-gray-400">8+ chars, upper, lower, number, special</Text>
        </View>
      )}

      <TouchableOpacity
        className={`bg-primary rounded-xl py-4 mb-8 ${isLoading ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text className="text-base font-bold text-center text-white">{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};
