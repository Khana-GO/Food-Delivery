import React from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className,
  style,
  ...props
}) => {
  return (
    <View className={`w-full mb-4 ${className}`}>
      {label && (
        <Text variant="bodySmall" weight="bold" color={Colors.text} className="mb-2 ml-1">
          {label}
        </Text>
      )}
      
      <View 
        className={`flex-row items-center h-16 px-5 rounded-2xl border ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-[#F8FAFC]'
        }`}
        style={style}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        
        <TextInput
          className="flex-1 text-[16px] font-medium text-slate-800"
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress} 
            disabled={!onRightIconPress}
            className="ml-3 p-2 -mr-2"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text variant="caption" color={Colors.error} className="mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
