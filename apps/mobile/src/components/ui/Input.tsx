import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  isPassword?: boolean;
  isLoading?: boolean;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'underline';
  onClear?: () => void;
  showClearButton?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  isPassword = false,
  isLoading = false,
  success = false,
  helperText,
  required = false,
  size = 'medium',
  variant = 'outlined',
  onClear,
  showClearButton = false,
  value,
  onChangeText,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: InputProps) {
  const [secureText, setSecureText] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(value || '');
  
  // Animations
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  // ── Derived states ──
  const hasError = !!error;
  const showSuccess = success && !hasError;
  const isFilled = text.length > 0;
  const showClear = showClearButton && isFilled && !isLoading && !isPassword;

  // ── Size configurations ──
  const sizeConfig = useMemo(() => {
    const configs = {
      small: { height: 40, fontSize: 13, paddingHorizontal: 12, iconSize: 16 },
      medium: { height: 52, fontSize: 15, paddingHorizontal: 14, iconSize: 20 },
      large: { height: 60, fontSize: 17, paddingHorizontal: 16, iconSize: 24 },
    };
    return configs[size] || configs.medium;
  }, [size]);

  // ── Variant configurations ──
  const variantStyles = useMemo(() => {
    const styles = {
      outlined: {
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
      },
      filled: {
        borderWidth: 0,
        backgroundColor: '#F8F9FA',
      },
      underline: {
        borderWidth: 0,
        borderBottomWidth: 1.5,
        borderRadius: 0,
        backgroundColor: 'transparent',
      },
    };
    return styles[variant] || styles.outlined;
  }, [variant]);

  // ── Animations ──
  const animateLabel = useCallback((toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [labelAnim]);

  const animateBorder = useCallback((toValue: number) => {
    Animated.timing(borderColorAnim, {
      toValue,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [borderColorAnim]);

  const shakeError = useCallback(() => {
    Animated.sequence([
      Animated.timing(errorShake, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorShake, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [errorShake]);

  // ── Handlers ──
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    animateLabel(1);
    animateBorder(1);
    onFocus?.(e);
  }, [onFocus, animateLabel, animateBorder]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    if (!isFilled) {
      animateLabel(0);
    }
    animateBorder(0);
    onBlur?.(e);
  }, [onBlur, isFilled, animateLabel, animateBorder]);

  const handleChangeText = useCallback((text: string) => {
    setText(text);
    if (text.length > 0) {
      animateLabel(1);
    } else if (!isFocused) {
      animateLabel(0);
    }
    onChangeText?.(text);
  }, [onChangeText, animateLabel, isFocused]);

  const togglePasswordVisibility = useCallback(() => {
    setSecureText(prev => !prev);
  }, []);

  const handleClear = useCallback(() => {
    handleChangeText('');
    onClear?.();
  }, [handleChangeText, onClear]);

  // ── Effects ──
  React.useEffect(() => {
    if (hasError) {
      shakeError();
    }
  }, [hasError, shakeError]);

  React.useEffect(() => {
    if (value !== undefined && value !== text) {
      setText(value);
      animateLabel(value ? 1 : 0);
    }
  }, [value, text, animateLabel]);

  // ── Border color interpolation ──
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      hasError ? '#EF4444' : '#E8ECF0',
      hasError ? '#EF4444' : '#E23744',
    ],
  });

  const borderBottomColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      hasError ? '#EF4444' : '#E8ECF0',
      hasError ? '#EF4444' : '#E23744',
    ],
  });

  // ── Render right icon with fixed positioning ──
  const renderRightIcon = useCallback(() => {
    // Always render password toggle if isPassword is true
    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconRight}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={secureText ? 'Show password' : 'Hide password'}
          activeOpacity={0.7}
        >
          <Feather
            name={secureText ? 'eye' : 'eye-off'}
            size={sizeConfig.iconSize}
            color={isFocused ? '#E23744' : '#666'}
          />
        </TouchableOpacity>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.iconRight}>
          <ActivityIndicator size="small" color="#E23744" />
        </View>
      );
    }

    if (showClear) {
      return (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.iconRight}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Feather name="x-circle" size={sizeConfig.iconSize} color="#999" />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconRight}
          disabled={!onRightIconPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }

    return null;
  }, [
    isPassword,
    secureText,
    togglePasswordVisibility,
    sizeConfig.iconSize,
    isFocused,
    isLoading,
    showClear,
    handleClear,
    rightIcon,
    onRightIconPress,
  ]);

  // ── Main render ──
  const inputContainerStyle = useMemo(() => {
    const baseStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      overflow: 'hidden',
      ...variantStyles,
      height: sizeConfig.height,
    };

    if (isFocused && !hasError) {
      baseStyle.borderColor = '#E23744';
      baseStyle.borderWidth = 1.5;
    }

    if (hasError) {
      baseStyle.borderColor = '#EF4444';
      baseStyle.borderWidth = 1.5;
    }

    if (showSuccess) {
      baseStyle.borderColor = '#22C55E';
      baseStyle.borderWidth = 1.5;
    }

    if (!editable) {
      baseStyle.opacity = 0.6;
      baseStyle.backgroundColor = '#F5F6FA';
    }

    if (variant === 'underline') {
      baseStyle.borderRadius = 0;
      baseStyle.borderTopWidth = 0;
      baseStyle.borderLeftWidth = 0;
      baseStyle.borderRightWidth = 0;
      baseStyle.borderBottomColor = hasError ? '#EF4444' : (isFocused ? '#E23744' : '#E8ECF0');
    }

    return baseStyle;
  }, [variantStyles, sizeConfig.height, isFocused, hasError, showSuccess, editable, variant]);

  const inputTextStyle = useMemo(() => {
    const baseStyle: any = {
      flex: 1,
      fontSize: sizeConfig.fontSize,
      color: '#1A1A1A',
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      minHeight: 40,
      includeFontPadding: false,
      textAlignVertical: 'center',
    };

    if (leftIcon) {
      baseStyle.paddingLeft = 4;
    }

    // Ensure right padding is consistent when there's a right icon
    if (rightIcon || isPassword || showClear || isLoading) {
      baseStyle.paddingRight = 4;
    }

    if (!editable) {
      baseStyle.color = '#999';
    }

    return baseStyle;
  }, [sizeConfig.fontSize, sizeConfig.paddingHorizontal, leftIcon, rightIcon, isPassword, showClear, isLoading, editable]);

  const labelAnimationStyle = useMemo(() => ({
    transform: [
      {
        scale: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
      {
        translateY: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  }), [labelAnim]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.View style={[styles.labelContainer, labelAnimationStyle]}>
          <Text style={[
            styles.label,
            hasError && styles.labelError,
            showSuccess && styles.labelSuccess,
            labelStyle,
          ]}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          inputContainerStyle,
          {
            transform: [{ translateX: errorShake }],
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={inputTextStyle}
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          value={text}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...props}
        />

        {renderRightIcon()}
      </Animated.View>

      {(hasError || helperText) && (
        <View style={styles.helperContainer}>
          {hasError && (
            <Feather name="alert-circle" size={14} color="#EF4444" />
          )}
          <Text style={[
            styles.helperText,
            hasError && styles.errorText,
            showSuccess && styles.successText,
          ]}>
            {hasError ? error : helperText}
          </Text>
        </View>
      )}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles - Zomato Red Theme with Fixed Positioning
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  labelError: {
    color: '#EF4444',
  },
  labelSuccess: {
    color: '#22C55E',
  },
  requiredStar: {
    color: '#EF4444',
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: '100%',
  },
  iconRight: {
    paddingRight: 14,
    paddingLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: '100%',
    position: 'relative',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
  },
  successText: {
    color: '#22C55E',
  },
});