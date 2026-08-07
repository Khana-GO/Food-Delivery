import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppEntry() {
  const rootNavigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(seen === 'true');
      } catch (error) {
        console.error("Error reading async storage:", error);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  // Expo Router's <Redirect> will fail silently if the navigation state isn't ready.
  if (!rootNavigationState?.key || !isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.brand}>KhanaGo</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return <Redirect href={hasSeenOnboarding ? "/auth/login" : "/onboarding"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
});
