import { Text } from '@/components/ui/Text';
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function OTPScreen() {
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const { login } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      setError('Please enter the full 4-digit code.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const apiUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
        : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';
      
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Verification failed');
        setLoading(false);
        return;
      }
      
      login(data.user);
      router.replace('/(customer)' as any);
    } catch (e) {
      setError('Network error. Is the backend running?');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="absolute top-5 left-6 z-10 w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
      >
        <Text className="text-2xl text-slate-800 -mt-1">←</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-5 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-3xl font-extrabold text-slate-800 mb-2">Verify Phone</Text>
            <Text className="text-[15px] text-slate-500 leading-6">
              Code sent to <Text className="font-bold text-slate-800">{phone || '+977 9800000000'}</Text>
            </Text>
          </View>

          <View className="flex-row justify-between mb-4 px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                className={`w-[16%] aspect-square rounded-xl border-2 text-2xl font-bold text-center ${
                  error ? 'border-red-500' : 
                  digit ? 'border-primary bg-red-50 text-slate-800' : 
                  'border-slate-200 bg-white text-slate-800'
                }`}
                value={digit}
                onChangeText={(text) => handleChangeText(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          {error ? <Text className="text-red-500 text-sm text-center mb-4">{error}</Text> : null}

          <View className="flex-row justify-center mt-4">
            <Text className="text-[15px] text-slate-500">Didn't receive code? </Text>
            <TouchableOpacity>
              <Text className="text-[15px] text-primary font-bold">Resend</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Verify"
            onPress={handleVerify}
            loading={loading}
            fullWidth
            style={{ marginTop: 24, marginBottom: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
