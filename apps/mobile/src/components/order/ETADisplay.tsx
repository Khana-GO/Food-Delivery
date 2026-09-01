import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ETADisplayProps {
  etaInfo: any;
  isCalculating: boolean;
}

export const ETADisplay = ({ etaInfo, isCalculating }: ETADisplayProps) => {
  if (!etaInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isCalculating ? (
        <Text className="text-sm text-gray-500">Calculating ETA…</Text>
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-500">
            <Text style={styles.icon}>🕐</Text> {etaInfo.minutes} min
          </Text>
          <Text className="text-xs text-gray-500">
            • {etaInfo.distance}
          </Text>
          <Text className="text-xs text-gray-500">
            • {etaInfo.traffic} traffic
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: 'white', marginBottom: 16, borderRadius: 8 },
  icon: { marginRight: 4, fontSize: 12 },
});
