import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
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

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputRow, error ? styles.inputRowError : styles.inputRowNormal]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureText}
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
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  inputRowNormal: {
    borderColor: Colors.border,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 4,
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
