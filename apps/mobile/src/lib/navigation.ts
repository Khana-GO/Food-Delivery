import { router } from 'expo-router';

export function goBack(fallback: string = '/(customer)/(tabs)') {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as any);
    }
  } catch {
    router.replace(fallback as any);
  }
}
