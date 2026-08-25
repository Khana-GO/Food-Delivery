import React, { useState, useCallback } from "react";
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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from '@/lib/api-error';

// ────────────────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").min(5).max(255),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

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

// ────────────────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const { forgotPassword, isAuthenticating } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(
        result.error.flatten().fieldErrors.email?.[0] || "Invalid email",
      );
      return;
    }
    setError("");
    try {
      await forgotPassword({ email });
      setSuccess(true);
      Alert.alert(
        "Check Your Email",
        "If an account exists with this email, you will receive a password reset code.",
      );
      // Navigate to reset password after a delay
      setTimeout(() => {
        router.replace({
          pathname: "/(auth)/reset-password" as any,
          params: { email },
        });
      }, 1500);
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        "Something went wrong. Please try again.",
      );
      setError(msg);
    }
  }, [email, forgotPassword]);

  const goToLogin = useCallback(() => {
    router.replace("/(auth)/login" as any);
  }, []);

  const isSubmitting = isAuthenticating;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        }}
        className="w-full h-[240px]"
        imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/30 justify-center items-center px-6">
          <Logo />
        </View>
      </ImageBackground>

      <KeyboardAvoidingView
        className="flex-1 -mt-8"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="bg-white rounded-t-3xl px-6 pt-8 pb-6 shadow-lg shadow-black/5 min-h-[480px]">
            <View className="mb-6">
              <Text className="text-3xl font-extrabold text-black tracking-tight mb-1">
                Forgot Password
              </Text>
              <Text className="text-gray-500 text-sm tracking-wide">
                Enter your email address and we'll send you a verification code
                to reset your password.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                Email Address
              </Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 h-14">
                <Feather name="mail" size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base text-black py-3"
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                    setSuccess(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!isSubmitting}
                />
              </View>
              {error ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
              ) : null}
              {success ? (
                <Text className="text-green-500 text-xs mt-1 ml-1">
                  ✅ Code sent! Redirecting...
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 mt-4 mb-3 ${
                isSubmitting || !email ? "opacity-50" : ""
              } shadow-lg shadow-primary/25`}
              onPress={handleSubmit}
              disabled={isSubmitting || !email}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-base tracking-wide">
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-500 text-sm">
                Remember your password?{" "}
              </Text>
              <TouchableOpacity onPress={goToLogin} disabled={isSubmitting}>
                <Text className="text-primary font-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
