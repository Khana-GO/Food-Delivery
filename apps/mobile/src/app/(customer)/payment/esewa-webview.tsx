import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, Text, TouchableOpacity, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from '@/lib/axios';
import { useCartStore } from '@/stores/customer/cartStore';

export default function EsewaWebView() {
  const { orderId, amount } = useLocalSearchParams<{ orderId: string; amount: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const verifiedRef = useRef(false);
  // App routes returned by the backend – single source of truth for where the
  // user lands on success/failure. No hardcoded frontend success/failure pages.
  const successRouteRef = useRef<{ pathname: string; params: Record<string, string | number> } | null>(null);
  const failureRouteRef = useRef<{ pathname: string; params: Record<string, string | number> } | null>(null);
  const { clearCart } = useCartStore();

  // Navigate to the backend-provided app route (falls back to a known route if
  // the backend didn't send one).
  const goTo = (route: { pathname: string; params?: Record<string, string | number> } | null, fallback: string) => {
    if (route && route.pathname) {
      router.replace({ pathname: route.pathname, params: route.params } as any);
      return;
    }
    router.replace(fallback as any);
  };

  useEffect(() => {
    initializePayment();

    const onBackPress = () => {
      confirmCancel();
      return true;
    };
    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, []);

  const confirmCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel? You can retry payment anytime from your orders.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: () => router.replace('/(customer)/cart' as any),
        },
      ],
    );
  };

  const initializePayment = async () => {
    try {
      if (!orderId || !amount) {
        Alert.alert('Error', 'Missing order details');
        router.back();
        return;
      }
      const amtNum = parseFloat(amount);
      if (isNaN(amtNum) || amtNum <= 0) {
        Alert.alert('Error', 'Invalid amount');
        router.back();
        return;
      }
      const res = await api.post('/payment/esewa/initialize', {
        orderId,
        amount: amtNum,
      });
      // Backend returns { formUrl, fields, url, params, successRoute, failureRoute }
      // – support both v2 and legacy shapes.
      const formUrl: string = res.data.formUrl || res.data.url;
      const fields: Record<string, string> = res.data.fields || res.data.params;
      if (!formUrl || !fields) throw new Error('Invalid payment init response');
      successRouteRef.current = res.data.successRoute || null;
      failureRouteRef.current = res.data.failureRoute || null;

      // Build auto-submitting HTML form
      const inputs = Object.entries(fields)
        .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}" />`)
        .join('\n');
      const formHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body onload="document.forms[0].submit()" style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><p style="color:#64748B;">Redirecting to eSewa…</p><form method="POST" action="${formUrl}">${inputs}</form></body></html>`;
      setHtml(formHtml);
    } catch (e: any) {
      console.error('[eSewa] init failed', e?.response?.data || e.message);
      Alert.alert('Payment Error', e?.response?.data?.message || 'Failed to initialize eSewa');
      setIsError(true);
    }
  };

  const handleReturnUrl = (url: string) => {
    if (verifiedRef.current || isVerifying) return;
    // eSewa returns to our SUCCESS_URL or FAILURE_URL with ?data=... in both
    // cases. The URL path alone is NOT a reliable indicator of payment status
    // (eSewa can redirect to failure_url even after a successful charge).
    // Always verify with the backend using the signed callback `data`.
    const isReturn =
      url.includes('/payment/success') ||
      url.includes('/payment/failure') ||
      url.includes('/payment/cancel');
    if (!isReturn) return;
    verifiedRef.current = true;
    const dataParam = extractData(url);
    if (dataParam) {
      verifyPayment(dataParam);
    } else {
      verifyWithStatus();
    }
  };

  // Fired on every navigation state change (eSewa redirects).
  const handleNav = (navState: any) => {
    handleReturnUrl(navState?.url || '');
  };

  // Fired synchronously BEFORE the WebView attempts each request. In Expo Go
  // the callback host (e.g. http://192.168.x.x:8081) may be unreachable/dead,
  // so `onNavigationStateChange` alone is unreliable on a phone. Catching it
  // here guarantees we never miss the redirect, and returning false stops the
  // WebView from loading the dead callback URL.
  const handleShouldStart = (request: any) => {
    const url: string = request?.url || '';
    if (
      url.includes('/payment/success') ||
      url.includes('/payment/failure') ||
      url.includes('/payment/cancel')
    ) {
      handleReturnUrl(url);
      return false;
    }
    return true;
  };

  const extractData = (url: string): string | null => {
    try {
      const u = new URL(url);
      return u.searchParams.get('data');
    } catch {
      const q = url.split('?')[1] || '';
      const params = new URLSearchParams(q);
      return params.get('data');
    }
  };

  const verifyPayment = async (dataB64: string | null) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/payment/esewa/verify', { data: dataB64, orderId });
      const status = res.data?.status || res.data?.raw?.status;
      if (status === 'success' || status === 'COMPLETE') {
        await clearCart();
        Alert.alert('Payment Successful', 'Your payment was verified. Your order is now paid.');
        goTo(successRouteRef.current, `/(customer)/order-confirmation?id=${orderId}`);
      } else if (status === 'pending' || status === 'PENDING') {
        Alert.alert('Payment Pending', 'Payment could not be confirmed yet. Check your order for the latest status.');
        goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
      } else {
        // Could not confirm success from the verified result. Since eSewa RC
        // can be inconclusive, land the user on their order (which reflects the
        // backend's authoritative status) instead of dumping them to the cart.
        Alert.alert('Payment Pending', 'Your payment could not be confirmed yet. Check your order for the latest status.');
        goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
      }
    } catch (e: any) {
      console.error('[eSewa] verify failed', e?.response?.data || e.message);
      Alert.alert('Verification Error', e?.response?.data?.message || 'Failed to verify payment. Contact support with order ID.');
      goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyWithStatus = async () => {
    try {
      setIsVerifying(true);
      const res = await api.post('/payment/esewa/verify', { transactionUuid: orderId, totalAmount: String(amount), orderId });
      const s = res.data?.status || res.data?.raw?.status;
      if (s === 'success' || s === 'COMPLETE') {
        await clearCart();
        Alert.alert('Payment Successful', 'Your payment was verified. Your order is now paid.');
        goTo(successRouteRef.current, `/(customer)/order-confirmation?id=${orderId}`);
      } else if (s === 'pending' || s === 'PENDING') {
        Alert.alert('Payment Pending', 'Payment could not be confirmed yet. Check your order for the latest status.');
        goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
      } else {
        Alert.alert('Payment Pending', 'Your payment could not be confirmed yet. Check your order for the latest status.');
        goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
      }
    } catch (e: any) {
      console.error('[eSewa] verifyWithStatus failed', e?.response?.data || e.message);
      Alert.alert('Verification Error', 'Failed to verify payment. Please contact support with your order ID.');
      goTo(successRouteRef.current, `/(customer)/order/${orderId}`);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isError) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-lg font-medium text-red-500">Payment Initialization Failed</Text>
        <Text className="mt-2 text-sm text-center text-gray-500">Please check your connection and try again.</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.back()}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isVerifying) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-4 text-sm font-medium text-gray-700">Verifying payment…</Text>
        <Text className="mt-1 text-xs text-gray-500">Please wait</Text>
      </View>
    );
  }

  if (!html) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="mt-4 text-sm text-gray-500">Preparing eSewa…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Top Header Bar with Cancel Action */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 48,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#16A34A',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="shield" size={15} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>
              eSewa Payment
            </Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>
              Order #{orderId ? orderId.slice(0, 8).toUpperCase() : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={confirmCancel}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: '#FEE2E2',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <WebView
        source={{ html }}
        originWhitelist={['*']}
        onNavigationStateChange={handleNav}
        onShouldStartLoadWithRequest={handleShouldStart}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#E23744" />
            <Text className="mt-3 text-sm text-gray-500">Loading eSewa…</Text>
          </View>
        )}
      />
    </View>
  );
}
