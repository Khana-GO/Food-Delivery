// mobile/src/components/auth/GoogleLoginButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoogleLoginButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const GoogleLoginButton = ({
  onPress,
  isLoading,
  disabled = false,
}: GoogleLoginButtonProps) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2.5 py-3.5 rounded-xl border border-gray-200 bg-white ${
        disabled || isLoading ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#666" />
      ) : (
        <View className="flex-row items-center justify-center gap-2.5">
          <Ionicons name="logo-google" size={22} color="#EA4335" />
          <Text className="text-sm font-semibold text-black">
            Continue with Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
