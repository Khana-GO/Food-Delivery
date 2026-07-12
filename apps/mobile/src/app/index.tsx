import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../lib/axios";
import { HealthCheckResponse } from "@food_delivery/types";

const fetchHealth = async (): Promise<HealthCheckResponse> => {
  const { data } = await api.get<HealthCheckResponse>("/health");
  return data;
};

export default function HomeScreen() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,

    // Production settings
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Checking server status...</Text>
      </View>
    );
  }

  if (isError) {
    console.error(error);

    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to connect to the server.
        </Text>

        <Text style={styles.errorSubtitle}>
          {error instanceof Error
            ? error.message
            : "Something went wrong."}
        </Text>

        <Text style={styles.retry} onPress={() => refetch()}>
          Tap to Retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🍔 Food Delivery</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{data.status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Timestamp</Text>
        <Text style={styles.value}>
          {new Date(data.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },

  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#D32F2F",
    textAlign: "center",
  },

  errorSubtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },

  retry: {
    marginTop: 20,
    color: "#1976D2",
    fontWeight: "600",
    fontSize: 16,
  },
});