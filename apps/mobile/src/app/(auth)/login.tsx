import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  StatusBar,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getHomeRoute } from 'lib/roles';
import { useGoogleAuth } from '@/hooks/auth/useGoogleAuth';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

// ────────────────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

// ────────────────────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────────────────────

const Logo = React.memo(() => (
  <View className="items-center justify-center w-full">
    <View className="flex-row items-center gap-3">
      <Image
        source={require('@/assets/images/logo/logo.png')}
        style={{ width: 48, height: 48, borderRadius: 12 }}
        resizeMode="contain"
      />
      <View className="items-start">
        <Text className="text-3xl font-extrabold tracking-tight text-white">
          Khana<Text className="text-primary">Go</Text>
        </Text>
        <Text className="text-xs font-medium tracking-wide text-white/80">
          Delicious Food, Delivered Fast
        </Text>
      </View>
    </View>
  </View>
));

const Divider = React.memo(() => (
  <View className="flex-row items-center gap-4 mb-5">
    <View className="flex-1 h-px bg-gray-200" />
    <Text className="text-xs font-medium tracking-wider text-gray-400">
      or continue with
    </Text>
    <View className="flex-1 h-px bg-gray-200" />
  </View>
));

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
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'off';
  textContentType?: 'emailAddress' | 'password' | 'none';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
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
}: InputFieldProps) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-black mb-1.5">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-xl border ${
          hasError ? 'border-red-500' : 'border-gray-200'
        } bg-white px-4 h-14 ${!editable ? 'opacity-60 bg-gray-50' : ''}`}
      >
        <View className="mr-3">{leftIcon}</View>
        <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
          className="flex-1 py-3 text-base text-black"
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
        <Text className="mt-1 ml-1 text-xs text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
});

// ────────────────────────────────────────────────────────────────────────────
// Error Parser
// ────────────────────────────────────────────────────────────────────────────

function parseBackendError(error: any): string {
  const responseMessage = error?.response?.data?.message;
  const message = Array.isArray(responseMessage)
    ? responseMessage[0]
    : responseMessage || error?.message || '';
  const lowerMessage = String(message).toLowerCase();

  if (
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('invalid email or password')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (
    lowerMessage.includes('no account found with this email') ||
    lowerMessage.includes('please register first')
  ) {
    return 'No account found with this email. Please register first.';
  }
  if (lowerMessage.includes('verify your email')) {
    return 'Please verify your email address before logging in.';
  }
  if (lowerMessage.includes('account locked')) {
    return 'Your account has been locked. Please contact support.';
  }
  if (lowerMessage.includes('too many')) {
    return 'Too many failed login attempts. Please try again later.';
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Network error. Please check your internet connection.';
  }

  return message || 'Login failed. Please check your credentials and try again.';
}

// ────────────────────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { login, user, isAuthenticating } = useAuth();
  const { signInWithGoogle, isLoading: isGoogleLoading, request } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const loginAttemptsRef = useRef(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.replace(getHomeRoute(user.role) as any);
    }
  }, [user]);

  // Handlers
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setFieldErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
    setGeneralError('');
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setFieldErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
    setGeneralError('');
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validate = useCallback((): LoginFormValues | null => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return null;
    }
    setFieldErrors({});
    return result.data;
  }, [email, password]);



// ... inside LoginScreen
const handleLogin = useCallback(async () => {
  setGeneralError('');
  const values = validate();
  if (!values) return;

  loginAttemptsRef.current += 1;

  try {
    const user = await login({ email: values.email, password: values.password });
    loginAttemptsRef.current = 0;
    const homeRoute = getHomeRoute(user.role);
    router.replace(homeRoute as any);
  } catch (error: any) {
    const errorMessage = parseBackendError(error);
    const lower = errorMessage.toLowerCase();

    if (lower.includes('email')) {
      setFieldErrors((prev) => ({ ...prev, email: errorMessage }));
    } else if (lower.includes('password')) {
      setFieldErrors((prev) => ({ ...prev, password: errorMessage }));
    } else {
      setGeneralError(errorMessage);
    }
  }
}, [login, validate]);

  const handleSocialLogin = useCallback(() => {
    console.log('Social login requested: google');
  }, []);

  const goToRegister = useCallback(() => {
    router.replace('/(auth)/register' as any);
  }, []);

  const handleForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password' as any);
  }, []);

  const goToForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password' as any);
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
        className="w-full h-[280px]"
        imageStyle={{
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
        resizeMode="cover"
      >
        <View className="items-center justify-center flex-1 px-6 bg-black/30">
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
          <View className="bg-white rounded-t-3xl px-6 pt-8 pb-6 shadow-lg shadow-black/5 min-h-[560px]">
            {/* Header */}
            <View className="mb-6">
              <Text className="mb-1 text-3xl font-extrabold tracking-tight text-black">
                Welcome Back
              </Text>
              <Text className="text-sm tracking-wide text-gray-500">
                Sign in to continue exploring delicious food
              </Text>
            </View>

            {/* Form Fields */}
            <View className="gap-1 mb-2">
              <InputField
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                error={fieldErrors.email}
                editable={!isLoginLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                leftIcon={<Feather name="mail" size={20} color="#666" />}
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                error={fieldErrors.password}
                editable={!isLoginLoading}
                isPassword
                secureTextEntry={!showPassword}
                onTogglePassword={togglePasswordVisibility}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                leftIcon={<Feather name="lock" size={20} color="#666" />}
              />

              <View className="flex-row items-center justify-end mt-1 mb-2">
                <TouchableOpacity
                  onPress={goToForgotPassword}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  disabled={isLoginLoading}
                >
                  <Text className="text-sm font-semibold tracking-wide text-primary">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* General Error */}
            {generalError ? (
              <View className="flex-row items-center justify-center gap-1.5 mb-3 px-2">
                <Feather name="alert-triangle" size={16} color="#EF4444" />
                <Text className="flex-1 text-sm font-medium text-center text-red-500">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 mt-3 mb-5 ${
                isLoginLoading ? 'opacity-70' : ''
              } shadow-lg shadow-primary/25`}
              onPress={handleLogin}
              disabled={isLoginLoading}
              activeOpacity={0.8}
            >
              <Text className="text-base font-bold tracking-wide text-center text-white">
                {isLoginLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <Divider />

            {/* Social Login */}
            <View className="flex-row gap-3 mb-6">
              <GoogleLoginButton
                onPress={signInWithGoogle}
                isLoading={isGoogleLoading}
                disabled={!request}
                style={{ flex: 1 }}
              />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center">
              <Text className="text-sm text-gray-500">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={goToRegister}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                disabled={isLoginLoading}
              >
                <Text className="ml-1 text-sm font-bold text-primary">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
