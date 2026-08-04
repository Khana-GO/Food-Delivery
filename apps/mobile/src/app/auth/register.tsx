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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// Validation (matches backend RegisterUserDto)
// ────────────────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').min(5).max(255),
    phone: z
      .string()
      .length(10, 'Phone number must be exactly 10 digits')
      .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string(),
    agreed: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

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

const Divider = React.memo(() => (
  <View className="flex-row items-center gap-4 mb-5">
    <View className="flex-1 h-px bg-gray-200" />
    <Text className="text-gray-400 text-xs font-medium tracking-wider">
      or continue with
    </Text>
    <View className="flex-1 h-px bg-gray-200" />
  </View>
));

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: (provider: 'google' | 'apple') => void;
  disabled?: boolean;
}

const SocialButton = React.memo(({ provider, onPress, disabled }: SocialButtonProps) => {
  const isGoogle = provider === 'google';
  const handlePress = useCallback(() => onPress(provider), [onPress, provider]);

  return (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-2.5 py-3.5 rounded-xl border border-gray-200 bg-white ${
        disabled ? 'opacity-50' : ''
      }`}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isGoogle ? 'logo-google' : 'logo-apple'}
        size={22}
        color={isGoogle ? '#EA4335' : '#000000'}
      />
      <Text className="text-black font-semibold text-sm">
        {isGoogle ? 'Google' : 'Apple'}
      </Text>
    </TouchableOpacity>
  );
});

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  editable?: boolean;
  leftIcon: React.ReactNode;
  isPassword?: boolean;
  secureTextEntry?: boolean;
  onTogglePassword?: () => void;
  keyboardType?: 'email-address' | 'phone-pad' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'off' | 'name' | 'tel';
  textContentType?: 'emailAddress' | 'password' | 'name' | 'telephoneNumber' | 'none';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  required?: boolean;
}

const InputField = React.memo(({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  editable = true,
  leftIcon,
  isPassword = false,
  secureTextEntry = false,
  onTogglePassword,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType = 'none',
  returnKeyType = 'next',
  onSubmitEditing,
  required = false,
}: InputFieldProps) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-black mb-1.5">
        {label}
        {required && <Text className="text-red-500 ml-0.5"> *</Text>}
      </Text>
      <View
        className={`flex-row items-center rounded-xl border ${
          hasError ? 'border-red-500' : 'border-gray-200'
        } bg-white px-4 h-14 ${!editable ? 'opacity-60 bg-gray-50' : ''}`}
      >
        <View className="mr-3">{leftIcon}</View>
        <TextInput
          className="flex-1 text-base text-black py-3"
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="ml-2"
          >
            <Feather
              name={secureTextEntry ? 'eye' : 'eye-off'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
        {hasError && !isPassword && (
          <Feather name="alert-circle" size={20} color="#EF4444" />
        )}
      </View>
      {hasError && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
});

// ────────────────────────────────────────────────────────────────────────────
// Error Parser (same as login)
// ────────────────────────────────────────────────────────────────────────────

function parseBackendError(error: any): string {
  const responseMessage = error?.response?.data?.message;
  const message = Array.isArray(responseMessage)
    ? responseMessage[0]
    : responseMessage || error?.message || '';
  const lowerMessage = String(message).toLowerCase();

  if (lowerMessage.includes('email already registered')) {
    return 'This email is already registered. Please login or use a different email.';
  }
  if (lowerMessage.includes('phone already registered')) {
    return 'This phone number is already registered. Please use a different number.';
  }
  if (lowerMessage.includes('password must contain')) {
    return 'Password must contain uppercase, lowercase, and a number.';
  }
  if (lowerMessage.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Network error. Please check your internet connection.';
  }
  return message || 'Registration failed. Please try again.';
}

// ────────────────────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const { register, user, isAuthenticating } = useAuth();

  // Single state object for all form fields
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      router.replace('/(customer)' as any);
    }
  }, [user]);

  // Update form field
  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error when user types
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    setGeneralError('');
  }, []);

  const togglePasswordVisibility = useCallback(() => setShowPassword((prev) => !prev), []);
  const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword((prev) => !prev), []);

  const validate = useCallback((): RegisterFormValues | null => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const formattedErrors: FieldErrors = {};
      for (const key in errors) {
        const typedKey = key as keyof RegisterFormValues;
        formattedErrors[typedKey] = errors[typedKey]?.[0];
      }
      setFieldErrors(formattedErrors);
      return null;
    }
    setFieldErrors({});
    return result.data;
  }, [form]);
const handleRegister = useCallback(async () => {
  setGeneralError('');
  const values = validate();
  if (!values) return;

  try {
    const result = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      phone: values.phone,
    });
    // Registration successful – navigate to verify page with email
    router.replace({
      pathname: '/auth/verify-email' as any,
      params: { email: values.email },
    });
  } catch (error: any) {
    const errorMessage = parseBackendError(error);
    const lower = errorMessage.toLowerCase();

    if (lower.includes('email')) {
      setFieldErrors((prev) => ({ ...prev, email: errorMessage }));
    } else if (lower.includes('phone')) {
      setFieldErrors((prev) => ({ ...prev, phone: errorMessage }));
    } else if (lower.includes('password')) {
      setFieldErrors((prev) => ({ ...prev, password: errorMessage }));
    } else {
      setGeneralError(errorMessage);
    }
  }
}, [register, validate]);

  const handleSocialLogin = useCallback((provider: 'google' | 'apple') => {
    console.log(`Social login requested: ${provider}`);
  }, []);

  const goToLogin = useCallback(() => {
    router.replace('/auth/login' as any);
  }, []);

  const isLoginLoading = isAuthenticating;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Food Image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        }}
        className="w-full h-[240px]"
        imageStyle={{
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/30 justify-center items-center px-6">
          <Logo />
        </View>
      </ImageBackground>

      {/* Form Section */}
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
          <View className="bg-white rounded-t-3xl px-6 pt-8 pb-6 shadow-lg shadow-black/5 min-h-[620px]">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-extrabold text-black tracking-tight mb-1">
                Create Account
              </Text>
              <Text className="text-gray-500 text-sm tracking-wide">
                Join KhanaGo and start ordering your favourites.
              </Text>
            </View>

            {/* Form Fields */}
            <View className="gap-1 mb-2">
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                value={form.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                error={fieldErrors.firstName}
                editable={!isLoginLoading}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                leftIcon={<Feather name="user" size={20} color="#666" />}
                required
              />

              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                value={form.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                error={fieldErrors.lastName}
                editable={!isLoginLoading}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                leftIcon={<Feather name="user" size={20} color="#666" />}
                required
              />

              <InputField
                label="Email Address"
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => updateField('email', text)}
                error={fieldErrors.email}
                editable={!isLoginLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                leftIcon={<Feather name="mail" size={20} color="#666" />}
                required
              />

              <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                value={form.phone}
                onChangeText={(text) => updateField('phone', text)}
                error={fieldErrors.phone}
                editable={!isLoginLoading}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                leftIcon={<Feather name="phone" size={20} color="#666" />}
                required
              />

              <InputField
                label="Password"
                placeholder="Create a password"
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
                error={fieldErrors.password}
                editable={!isLoginLoading}
                isPassword
                secureTextEntry={!showPassword}
                onTogglePassword={togglePasswordVisibility}
                autoComplete="password"
                textContentType="password"
                returnKeyType="next"
                leftIcon={<Feather name="lock" size={20} color="#666" />}
                required
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                error={fieldErrors.confirmPassword}
                editable={!isLoginLoading}
                isPassword
                secureTextEntry={!showConfirmPassword}
                onTogglePassword={toggleConfirmPasswordVisibility}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                leftIcon={<Feather name="lock" size={20} color="#666" />}
                required
              />
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              className="flex-row items-center gap-2.5 my-4"
              onPress={() => updateField('agreed', !form.agreed)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-2 ${
                  form.agreed ? 'bg-primary border-primary' : 'border-gray-300'
                } items-center justify-center`}
              >
                {form.agreed && <Feather name="check" size={14} color="white" />}
              </View>
              <Text className="text-gray-500 text-sm flex-1 flex-wrap">
                I agree to the{' '}
                <Text className="text-black font-bold">Terms</Text>
                {' & '}
                <Text className="text-black font-bold">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {fieldErrors.agreed && (
              <Text className="text-red-500 text-xs -mt-2 mb-2 ml-1">
                {fieldErrors.agreed}
              </Text>
            )}

            {/* General Error */}
            {generalError ? (
              <View className="flex-row items-center justify-center gap-1.5 mb-3 px-2">
                <Feather name="alert-triangle" size={16} color="#EF4444" />
                <Text className="text-red-500 text-sm text-center flex-1 font-medium">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 mt-2 mb-5 ${
                isLoginLoading || !form.agreed ? 'opacity-50' : ''
              } shadow-lg shadow-primary/25`}
              onPress={handleRegister}
              disabled={isLoginLoading || !form.agreed}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-base tracking-wide">
                {isLoginLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <Divider />

            {/* Social Login */}
            <View className="flex-row gap-3 mb-6">
              <SocialButton
                provider="google"
                onPress={handleSocialLogin}
                disabled={isLoginLoading}
              />
              <SocialButton
                provider="apple"
                onPress={handleSocialLogin}
                disabled={isLoginLoading}
              />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500 text-sm">
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={goToLogin}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={isLoginLoading}
              >
                <Text className="text-primary font-bold text-sm ml-1">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}