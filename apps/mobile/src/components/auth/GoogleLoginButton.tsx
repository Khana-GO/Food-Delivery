// mobile/src/components/auth/GoogleLoginButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Image } from 'react-native';

interface GoogleLoginButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const GoogleLogo = () => (
  <View
    style={{
      width: 22,
      height: 22,
    }}
  >
    <Image
      source={{
        uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
      }}
      style={{ width: 22, height: 22 }}
      resizeMode="contain"
    />
  </View>
);

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
          <GoogleLogo />
          <Text className="text-sm font-semibold text-black">
            Continue with Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
