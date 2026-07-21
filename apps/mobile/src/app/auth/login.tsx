import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

const loginSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setApiError('');
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const fullPhone = `+977${data.phone}`;
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        setApiError(result.message || 'Login failed');
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
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo Section */}
          <View className="items-center mt-2 mb-10">
            <Image
              source={require('../../../assets/images/app_logo.png')}
              style={{ width: 96, height: 96, marginBottom: 16 }}
              resizeMode="contain"
            />
            <View className="flex-row items-center justify-center">
              <Text className="text-[26px] font-extrabold text-[#1E293B]">Khana</Text>
              <Text className="text-[26px] font-extrabold text-[#FF8A00] ml-1">Go</Text>
            </View>
            <Text className="text-[14px] text-[#64748B] mt-1">Delicious Food, Delivered Fast.</Text>
          </View>

          {/* Welcome Text Section */}
          <View className="mb-8">
            <Text className="text-[32px] font-extrabold text-[#1E293B] mb-2 leading-[40px]">Welcome Back</Text>
            <Text className="text-[15px] text-[#64748B]">Sign in to continue ordering your favourites.</Text>
          </View>

          <View className="w-full">
            {apiError ? <Text className="text-red-500 text-sm mb-4">{apiError}</Text> : null}

            {/* Phone Input */}
            <View className="mb-8">
              <Text className="text-[13px] font-bold text-[#475569] mb-2">Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`flex-row items-center border-[1.5px] rounded-2xl px-4 h-14 ${errors.phone ? 'border-red-500 bg-white' : 'border-[#E2E8F0] bg-white'}`}>
                    <Ionicons name="call-outline" size={20} color={errors.phone ? '#EF4444' : '#64748B'} style={{ marginRight: 10 }} />
                    <Text className="text-[15px] font-semibold text-[#1E293B] mr-2">+977</Text>
                    <TextInput
                      className="flex-1 text-[15px] text-[#1E293B] h-full"
                      placeholder="9800000000"
                      placeholderTextColor="#94A3B8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                    {errors.phone && (
                      <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                    )}
                  </View>
                )}
              />
              {errors.phone && <Text className="text-[#EF4444] text-[12px] mt-1.5 ml-1">{errors.phone.message}</Text>}
            </View>

            {/* Log In Button */}
            <TouchableOpacity 
              className="bg-[#FF8A00] h-14 rounded-2xl items-center justify-center shadow-sm mb-8"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white text-[16px] font-bold">
                {loading ? 'Sending OTP...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
              <Text className="px-4 text-[13px] text-[#64748B]">or continue with</Text>
              <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row justify-between gap-4 mb-8">
              <TouchableOpacity className="flex-1 h-[52px] rounded-2xl border-[1px] border-[#E2E8F0] bg-white flex-row items-center justify-center">
                <Ionicons name="logo-google" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                <Text className="text-[15px] font-bold text-[#1E293B]">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-[52px] rounded-2xl border-[1px] border-[#E2E8F0] bg-white flex-row items-center justify-center">
                <Ionicons name="logo-apple" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                <Text className="text-[15px] font-bold text-[#1E293B]">Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center pb-6">
              <Text className="text-[#64748B] text-[15px]">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
                <Text className="text-[#FF8A00] font-bold text-[15px]">Sign Up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
