import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppEntry() {
  useEffect(() => {
    const init = async () => {
      await new Promise((r) => setTimeout(r, 800));
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (seen === 'true') {
        router.replace('/auth/login');
      } else {
        router.replace('/onboarding');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>KhanaGo</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 24 }} />
    </View>
  );
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
