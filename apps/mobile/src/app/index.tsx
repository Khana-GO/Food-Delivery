import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../lib/axios";
import { HealthCheckResponse, FoodItem } from "@food_delivery/types";

const fetchHealth = async (): Promise<HealthCheckResponse> => {
  const { data } = await api.get("/health");
  return data;
};

export default function HomeScreen() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>{error.message}</Text>
        <Text onPress={() => refetch()}>Retry</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
      </View>

      <Text style={styles.category}>{item.category}</Text>
    </View>
  );

  return (
    <FlatList
      data={data.data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>🍔 Food Delivery</Text>

          <Text style={styles.status}>
            Status: {data.status.toUpperCase()}
          </Text>

          <Text style={styles.time}>
            {new Date(data.timestamp).toLocaleString()}
          </Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListFooterComponent={<View style={{ height: 20 }} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  status: {
    marginTop: 8,
    color: "green",
    fontWeight: "600",
  },

  time: {
    color: "#666",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53935",
  },

  category: {
    marginTop: 8,
    color: "#666",
  },
});