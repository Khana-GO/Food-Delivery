import React from 'react';
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'large',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  className,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#E5E7EB';
    switch (variant) {
      case 'primary': return Colors.primary;
      case 'secondary': return Colors.backgroundSecondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#9CA3AF';
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return Colors.text;
      case 'outline': return Colors.primary;
      case 'ghost': return Colors.textSecondary;
      default: return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return 'py-2 px-4';
      case 'medium': return 'py-3 px-6';
      case 'large': return 'py-4 px-8';
      default: return 'py-4 px-8';
    }
  };

  const getBorderStyles = () => {
    if (variant === 'outline') {
      return `border-2 border-[${Colors.primary}]`;
    }
    return '';
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center rounded-[16px] ${getPadding()} ${getBorderStyles()} ${fullWidth ? 'w-full' : 'self-center'} ${className}`}
      style={[{ backgroundColor: getBackgroundColor() }, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text 
            weight="bold" 
            color={getTextColor()}
            style={{ fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18 }}
          >
            {label}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};
