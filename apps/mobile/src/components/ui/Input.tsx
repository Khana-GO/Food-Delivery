import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword,
  ...props
}: InputProps) {
  const [secureText, setSecureText] = useState(isPassword ?? false);
  const [isFocused, setIsFocused] = useState(false);

  // Border color logic
  let borderColor: string = Colors.border;
  if (error) borderColor = Colors.error;
  else if (isFocused) borderColor = Colors.primary;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inputRow, { borderColor }]}>
        {label ? (
          <View style={styles.floatingLabelContainer}>
            <Text style={[
              styles.floatingLabel, 
              { color: error ? Colors.error : (isFocused ? Colors.primary : Colors.textSecondary) }
            ]}>
              {label}
            </Text>
          </View>
        ) : null}

        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureText}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setSecureText((v) => !v)}
            style={styles.iconRight}
          >
            <Text style={styles.eyeIcon}>{secureText ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    marginTop: 10, // give space for floating label
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
    position: 'relative',
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    zIndex: 10,
  },
  floatingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconRight: {
    paddingRight: 14,
    paddingLeft: 4,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: Colors.textDark,
    paddingHorizontal: 14,
    fontWeight: '500',
  },
  inputWithLeft: {
    paddingLeft: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});
