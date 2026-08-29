import { router } from 'expo-router';

export function goBack(fallback: string = '/(admin)/(tabs)/index') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
}
