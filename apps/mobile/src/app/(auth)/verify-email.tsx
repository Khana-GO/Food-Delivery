import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from '@/lib/api-error';

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

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyEmail, resendVerificationCode, isAuthenticating } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  const handleVerify = useCallback(async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    try {
      await verifyEmail({ email, code });
      setSuccess(true);
      // Navigate to login after a short delay
      setTimeout(() => {
        router.replace("/(auth)/login" as any);
      }, 1500);
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        "Verification failed. Please try again.",
      );
      setError(msg);
    }
  }, [code, email, verifyEmail]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      await resendVerificationCode(email);
      setResendCooldown(60); // 60 seconds cooldown
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email.",
      );
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        "Failed to resend code. Please try again.",
      );
      setError(msg);
    }
  }, [email, resendVerificationCode, resendCooldown]);

  const goToLogin = useCallback(() => {
    router.replace("/(auth)/login" as any);
  }, []);

  const isVerifying = isAuthenticating;

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
                Verify Email
              </Text>
              <Text className="text-gray-500 text-sm tracking-wide">
                We sent a 6-digit verification code to
              </Text>
              <Text className="text-primary font-semibold text-sm mt-1">
                {email}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-black mb-1.5">
                Enter Code
              </Text>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 h-14">
                <Feather name="mail" size={20} color="#666" />
                <TextInput selectionColor="rgba(15,23,42,0.16)" cursorColor="#334155"
                  className="flex-1 ml-3 text-base text-black py-3"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                  editable={!isVerifying}
                />
                {code.length === 6 && (
                  <Feather name="check-circle" size={20} color="#22C55E" />
                )}
              </View>
              {error ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
              ) : null}
              {success ? (
                <Text className="text-green-500 text-xs mt-1 ml-1">
                  ✅ Verified! Redirecting to login...
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 mt-4 mb-3 ${
                isVerifying || code.length !== 6 ? "opacity-50" : ""
              } shadow-lg shadow-primary/25`}
              onPress={handleVerify}
              disabled={isVerifying || code.length !== 6}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-base tracking-wide">
                {isVerifying ? "Verifying..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-gray-500 text-sm">
                Didn't receive the code?{" "}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || isVerifying}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-primary font-semibold text-sm ${
                    resendCooldown > 0 || isVerifying ? "opacity-50" : ""
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend (${resendCooldown}s)`
                    : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-500 text-sm">Already verified? </Text>
              <TouchableOpacity onPress={goToLogin} disabled={isVerifying}>
                <Text className="text-primary font-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
