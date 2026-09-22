import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, Text, TouchableOpacity, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from '@/lib/axios';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { goBack } from '@/lib/navigation';

/**
 * eSewa WebView – pre-payment flow
 *
 * The order is NOT created until the payment is verified as COMPLETE.
 * The screen receives the full order payload (JSON-encoded) plus the
 * payment amount. After eSewa redirects back, the callback data is
 * verified server-side, and only THEN is the order created as PAID.
 *
 * Params (all passed as URL search params via Expo Router):
 *   payload  – JSON-encoded order payload { restaurantId, addressId, items, notes }
 *   amount   – total amount to charge
 */
export default function EsewaWebView() {
  const params = useLocalSearchParams<{
    payload?: string;
    amount?: string;
    transactionUuid?: string;
  }>();

  const [html, setHtml] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const verifiedRef = useRef(false);
  const transactionUuidRef = useRef<string | null>(null);

  const orderPayload = params.payload ? JSON.parse(params.payload) : null;
  const amount = params.amount;

  useEffect(() => {
    initializePayment();
    const onBackPress = () => { confirmCancel(); return true; };
    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, []);

  const confirmCancel = () => {
    setCancelDialog(true);
  };

  const initializePayment = async () => {
    try {
      if (!orderPayload || !amount) {
        Alert.alert('Error', 'Missing order details');
        goBack('/(customer)/checkout');
        return;
      }
      const amtNum = parseFloat(amount);
      if (isNaN(amtNum) || amtNum <= 0) {
        Alert.alert('Error', 'Invalid amount');
        goBack('/(customer)/checkout');
        return;
      }

      // Generate a unique transaction UUID on the client. This will be used
      // as the eSewa transaction_uuid and later passed back to the verify
      // endpoint so the order can be created with the same reference.
      const txUuid = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      transactionUuidRef.current = txUuid;

      const res = await api.post('/payment/esewa/initialize', {
        amount: amtNum,
        transactionUuid: txUuid,
      });

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

  const handleReturnUrl = (url: string) => {
    if (verifiedRef.current || isVerifying) return;
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
      // No callback data – try verify with transaction UUID + amount
      verifyWithStatus();
    }
  };

  const handleNav = (navState: any) => { handleReturnUrl(navState?.url || ''); };

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

  // ─── Primary verify path: callback data ───
  const verifyPayment = async (dataB64: string | null) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/payment/esewa/verify-and-create', {
        data: dataB64,
        transactionUuid: transactionUuidRef.current,
        restaurantId: orderPayload.restaurantId,
        addressId: orderPayload.addressId,
        items: orderPayload.items,
        notes: orderPayload.notes,
        promoCode: orderPayload.promoCode,
      });
      const status = res.data?.status || res.data?.raw?.status;
      if (status === 'success' || status === 'COMPLETE') {
        const orderId = res.data?.order?.id;
        Alert.alert('Payment Successful', 'Your payment was verified and order confirmed.');
        router.replace({
          pathname: '/(customer)/order-confirmation',
          params: { id: orderId || '' },
        } as any);
      } else if (status === 'pending' || status === 'PENDING') {
        Alert.alert('Payment Pending', 'Payment could not be confirmed yet. Check your orders for the latest status.');
        router.replace('/(customer)/(tabs)/orders' as any);
      } else {
        Alert.alert('Payment Failed', res.data?.message || 'Payment could not be confirmed. No amount was deducted.');
        router.replace('/(customer)/checkout/failure' as any);
      }
    } catch (e: any) {
      console.error('[eSewa] verify failed', e?.response?.data || e.message);
      Alert.alert('Verification Error', e?.response?.data?.message || 'Failed to verify payment. Contact support.');
      router.replace('/(customer)/checkout/failure' as any);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Fallback: no callback data, use status API ───
  const verifyWithStatus = async () => {
    try {
      setIsVerifying(true);
      const res = await api.post('/payment/esewa/verify-and-create', {
        transactionUuid: transactionUuidRef.current,
        totalAmount: amount,
        restaurantId: orderPayload.restaurantId,
        addressId: orderPayload.addressId,
        items: orderPayload.items,
        notes: orderPayload.notes,
        promoCode: orderPayload.promoCode,
      });
      const s = res.data?.status || res.data?.raw?.status;
      if (s === 'success' || s === 'COMPLETE') {
        const orderId = res.data?.order?.id;
        Alert.alert('Payment Successful', 'Your payment was verified and order confirmed.');
        router.replace({
          pathname: '/(customer)/order-confirmation',
          params: { id: orderId || '' },
        } as any);
      } else if (s === 'pending' || s === 'PENDING') {
        Alert.alert('Payment Pending', 'Payment could not be confirmed yet. Check your orders for the latest status.');
        router.replace('/(customer)/(tabs)/orders' as any);
      } else {
        Alert.alert('Payment Failed', 'Payment could not be confirmed. No amount was deducted.');
        router.replace('/(customer)/checkout/failure' as any);
      }
    } catch (e: any) {
      console.error('[eSewa] verifyWithStatus failed', e?.response?.data || e.message);
      Alert.alert('Verification Error', 'Failed to verify payment. Contact support.');
      router.replace('/(customer)/checkout/failure' as any);
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
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => goBack('/(customer)/checkout')}>
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
        <Text className="mt-1 text-xs text-gray-500">Please wait while we confirm your payment</Text>
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
              Amount: Rs. {amount}
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

      <ConfirmDialog
        visible={cancelDialog}
        title="Cancel Payment?"
        message="Are you sure you want to cancel? No amount will be deducted."
        confirmLabel="Cancel Payment"
        icon="alert-triangle"
        tone="danger"
        onClose={() => setCancelDialog(false)}
        onConfirm={() => {
          setCancelDialog(false);
          router.replace('/(customer)/checkout' as any);
        }}
      />
    </View>
  );
}
