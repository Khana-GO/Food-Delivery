import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  agreed: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      agreed: false,
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setApiError('');
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const fullPhone = `+977${data.phone}`;
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'NA';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone: fullPhone }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        setApiError(result.message || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push({ pathname: '/auth/otp', params: { phone: fullPhone } } as any);
    } catch (e) {
      setApiError('Network error. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-10 justify-center"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="items-center mb-10">
            <Image 
              source={require('../../../assets/images/app_logo.png')} 
              style={{ width: 96, height: 96, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-extrabold text-slate-800 mb-2">KhanaGo</Text>
            <Text className="text-[15px] text-slate-500 text-center">Join KhanaGo and discover your next favorite meal.</Text>
          </View>

          <View className="w-full">
            {apiError ? <Text className="text-red-500 text-sm mb-4 text-center">{apiError}</Text> : null}

            <View className="gap-4">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Anish Shrestha"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.fullName?.message}
                    leftIcon={<Text className="text-base">👤</Text>}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mobile Number"
                    placeholder="9800000000"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.phone?.message}
                    keyboardType="phone-pad"
                    leftIcon={<Text className="text-base text-slate-500 font-medium mr-2">+977</Text>}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="agreed"
              render={({ field: { onChange, value } }) => (
                <View className="mt-2 mb-6">
                  <TouchableOpacity
                    className="flex-row items-center gap-3 my-2"
                    onPress={() => onChange(!value)}
                    activeOpacity={0.7}
                  >
                    <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${value ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                      {value && <Text className="text-white text-xs font-bold">✓</Text>}
                    </View>
                    <Text className="text-sm text-slate-500 flex-1">
                      I agree to the <Text className="text-slate-800 font-bold">Terms</Text> &amp; <Text className="text-slate-800 font-bold">Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agreed?.message && <Text className="text-red-500 text-xs ml-9">{errors.agreed.message}</Text>}
                </View>
              )}
            />

            <Button
              label="Sign Up"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              style={{ marginTop: 8, marginBottom: 24 }}
            />

            <View className="flex-row justify-center items-center">
              <Text className="text-slate-500 text-[15px]">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text className="text-primary font-bold text-[15px]">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
