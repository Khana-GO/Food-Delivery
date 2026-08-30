import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

/**
 * Legacy route `(customer)/profile` — kept for backwards compat.
 * The canonical profile is `(customer)/(tabs)/profile`.
 * Redirect there to avoid duplicate screens and expo-router ambiguity.
 */
export default function CustomerProfileRedirect() {
  return <Redirect href="/(customer)/(tabs)/profile" />;
}
