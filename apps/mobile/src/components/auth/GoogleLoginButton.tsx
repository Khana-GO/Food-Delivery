// mobile/src/components/auth/GoogleLoginButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';

interface GoogleLoginButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

// Scale factor based on screen width (base: 375)
const scale = (size: number, width: number) => (width / 375) * size;

// Google logo from official Google identity assets
const GoogleLogo = ({ size }: { size: number }) => (
  <Image
    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

export const GoogleLoginButton = ({
  onPress,
  isLoading,
  disabled = false,
}: GoogleLoginButtonProps) => {
  const { width } = useWindowDimensions();

  // Responsive sizes – now with extra‑rounded corners
  const logoSize = scale(24, width);
  const paddingVertical = scale(14, width);
  const borderRadius = Math.min(scale(30, width), 40); // more rounded, capped at 40
  const fontSize = scale(15, width);
  const gap = scale(10, width);
  const maxWidth = Math.min(width * 0.9, 400);

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: gap,
        paddingVertical: paddingVertical,
        borderRadius: borderRadius,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
        opacity: disabled || isLoading ? 0.5 : 1,
        width: '100%',
        maxWidth: maxWidth,
        alignSelf: 'center',
      }}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#666666" />
      ) : (
        <>
          <GoogleLogo size={logoSize} />
          <Text
            style={{
              fontSize: fontSize,
              fontWeight: '600',
              color: '#000000',
              textAlign: 'center',
            }}
          >
            Continue with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};