import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
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
  const { clearCart } = useCartStore();

  useEffect(() => {
    initializePayment();
  }, []);

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
      // Backend returns { formUrl, fields, url, params } – support both v2 and legacy
      const formUrl: string = res.data.formUrl || res.data.url;
      const fields: Record<string, string> = res.data.fields || res.data.params;
      if (!formUrl || !fields) throw new Error('Invalid payment init response');

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

  const handleNav = async (navState: any) => {
    const url: string = navState.url || '';
    if (verifiedRef.current || isVerifying) return;
    // eSewa will redirect to our SUCCESS_URL / FAILURE_URL which contain /payment/success or /payment/failure with ?data=...
    if (url.includes('/payment/success')) {
      verifiedRef.current = true;
      const dataParam = extractData(url);
      if (!dataParam) {
        // Fallback: try to verify via status API using orderId + amount
        await verifyWithStatus();
      } else {
        await verifyPayment(dataParam);
      }
      return;
    }
    if (url.includes('/payment/failure') || url.includes('/payment/cancel')) {
      verifiedRef.current = true;
      Alert.alert('Payment Canceled', 'You canceled the payment or it failed.');
      router.replace('/(customer)/cart' as any);
    }
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
        try { await clearCart(); } catch {}
        Alert.alert('Payment Success', 'Your payment was verified. Order is now paid.');
        router.replace({ pathname: '/(customer)/order-confirmation' as any, params: { id: orderId } } as any);
      } else if (status === 'pending' || status === 'PENDING') {
        Alert.alert('Payment Pending', 'Payment is pending. We will confirm shortly.');
        router.replace(`/(customer)/order/${orderId}` as any);
      } else {
        Alert.alert('Verification Failed', res.data?.message || 'Payment could not be verified');
        router.replace('/(customer)/cart' as any);
      }
    } catch (e: any) {
      console.error('[eSewa] verify failed', e?.response?.data || e.message);
      Alert.alert('Verification Error', e?.response?.data?.message || 'Failed to verify payment. Contact support with order ID.');
      router.replace('/(customer)/cart' as any);
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
        try { await clearCart(); } catch {}
        router.replace({ pathname: '/(customer)/order-confirmation' as any, params: { id: orderId } } as any);
      } else {
        verifyPayment(null);
      }
    } catch {
      verifyPayment(null);
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
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        onNavigationStateChange={handleNav}
        onShouldStartLoadWithRequest={() => true}
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
