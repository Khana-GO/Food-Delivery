import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Enter a valid 6-digit code'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
type FieldErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

// ────────────────────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────────────────────

const Logo = React.memo(() => (
  <View className="items-center justify-center w-full">
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/30">
        <MaterialCommunityIcons name="food" size={32} color="#FFFFFF" />
      </View>
      <View className="items-start">
        <Text className="text-3xl font-extrabold tracking-tight text-white">
          Khana<Text className="text-primary">Go</Text>
        </Text>
        <Text className="text-white/80 text-xs font-medium tracking-wide">
          Delicious Food, Delivered Fast
        </Text>
      </View>
    </View>
  </View>
));

// ────────────────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────────────────

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword, isAuthenticating } = useAuth();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = useCallback((): ResetPasswordFormValues | null => {
    const result = resetPasswordSchema.safeParse({ code, newPassword, confirmPassword });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const formatted: FieldErrors = {};
      (Object.keys(errors) as Array<keyof ResetPasswordFormValues>).forEach((key) => {
        formatted[key] = errors[key]?.[0];
      });
      setFieldErrors(formatted);
      return null;
    }
    setFieldErrors({});
    return result.data;
  }, [code, newPassword, confirmPassword]);

  const handleSubmit = useCallback(async () => {
    setGeneralError('');
    const values = validate();
    if (!values) return;

    try {
      await resetPassword({
        email: email as string,
        code: values.code,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      Alert.alert('Success', 'Your password has been reset. Please log in with your new password.');
      setTimeout(() => {
        router.replace('/auth/login' as any);
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      const lower = msg.toLowerCase();
      if (lower.includes('code')) {
        setFieldErrors((prev) => ({ ...prev, code: msg }));
      } else if (lower.includes('password')) {
        setFieldErrors((prev) => ({ ...prev, newPassword: msg }));
      } else {
        setGeneralError(msg);
      }
    }
  }, [code, newPassword, confirmPassword, email, resetPassword, validate]);

  const toggleShowNewPassword = useCallback(() => setShowNewPassword((prev) => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword((prev) => !prev), []);

  const isSubmitting = isAuthenticating;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        }}
        className="w-full h-[240px]"
        imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/30 justify-center items-center px-6">
          <Logo />
        </View>
      </ImageBackground>

      <KeyboardAvoidingView
        className="flex-1 -mt-8"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="bg-white rounded-t-3xl px-6 pt-8 pb-6 shadow-lg shadow-black/5 min-h-[520px]">
            <View className="mb-6">
              <Text className="text-3xl font-extrabold text-black tracking-tight mb-1">
                Reset Password
              </Text>
              <Text className="text-gray-500 text-sm tracking-wide">
                Enter the 6-digit code sent to your email and set a new password.
              </Text>
              <Text className="text-primary font-semibold text-sm mt-1">
                {email}
              </Text>
            </View>

            {/* OTP Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                Verification Code
              </Text>
              <View className={`flex-row items-center rounded-xl border ${fieldErrors.code ? 'border-red-500' : 'border-gray-200'} bg-white px-4 h-14`}>
                <Feather name="mail" size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base text-black py-3"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text.replace(/\D/g, '').slice(0, 6));
                    setFieldErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
              </View>
              {fieldErrors.code && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.code}</Text>}
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                New Password
              </Text>
              <View className={`flex-row items-center rounded-xl border ${fieldErrors.newPassword ? 'border-red-500' : 'border-gray-200'} bg-white px-4 h-14`}>
                <Feather name="lock" size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base text-black py-3"
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  secureTextEntry={!showNewPassword}
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={toggleShowNewPassword} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {fieldErrors.newPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.newPassword}</Text>}
            </View>

            {/* Confirm Password */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                Confirm Password
              </Text>
              <View className={`flex-row items-center rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'} bg-white px-4 h-14`}>
                <Feather name="lock" size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base text-black py-3"
                  placeholder="Confirm your new password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={toggleShowConfirmPassword} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.confirmPassword}</Text>}
            </View>

            {/* General Error */}
            {generalError && (
              <View className="flex-row items-center justify-center gap-1.5 mb-3 px-2">
                <Feather name="alert-triangle" size={16} color="#EF4444" />
                <Text className="text-red-500 text-sm text-center flex-1 font-medium">{generalError}</Text>
              </View>
            )}

            {success && (
              <View className="flex-row items-center justify-center gap-1.5 mb-3 px-2">
                <Feather name="check-circle" size={16} color="#22C55E" />
                <Text className="text-green-500 text-sm text-center flex-1 font-medium">
                  Password reset successful! Redirecting to login...
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 mt-2 mb-3 ${
                isSubmitting || !code || !newPassword ? 'opacity-50' : ''
              } shadow-lg shadow-primary/25`}
              onPress={handleSubmit}
              disabled={isSubmitting || !code || !newPassword}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-base tracking-wide">
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-gray-500 text-sm">Didn't receive the code? </Text>
              <TouchableOpacity
                onPress={() => {
                  router.replace({
                    pathname: '/auth/forgot-password' as any,
                    params: { email },
                  });
                }}
                disabled={isSubmitting}
              >
                <Text className="text-primary font-semibold text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-500 text-sm">Remember your password? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)} disabled={isSubmitting}>
                <Text className="text-primary font-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}