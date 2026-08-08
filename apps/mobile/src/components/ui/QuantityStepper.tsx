import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'medium',
  style,
}) => {
  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  const btnSize = size === 'small' ? 32 : size === 'large' ? 44 : 38;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const textSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.btn,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          isMinDisabled && styles.disabledBtn,
        ]}
        onPress={onDecrement}
        disabled={isMinDisabled}
        accessibilityLabel="Decrease quantity"
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <Ionicons
          name={value === 1 && min === 0 ? 'trash-outline' : 'remove'}
          size={iconSize}
          color={isMinDisabled ? '#CBD5E1' : value === 1 && min === 0 ? '#EF4444' : '#1E293B'}
        />
      </TouchableOpacity>

      <Text
        style={[styles.valueText, { fontSize: textSize }]}
        accessibilityLabel={`Quantity ${value}`}
      >
        {value}
      </Text>

      <TouchableOpacity
        style={[
          styles.btn,
          styles.addBtn,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          isMaxDisabled && styles.disabledBtn,
        ]}
        onPress={onIncrement}
        disabled={isMaxDisabled}
        accessibilityLabel="Increase quantity"
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <Ionicons
          name="add"
          size={iconSize}
          color={isMaxDisabled ? '#CBD5E1' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtn: {
    backgroundColor: '#1E293B',
  },
  disabledBtn: {
    backgroundColor: '#F1F5F9',
    shadowOpacity: 0,
    elevation: 0,
  },
  valueText: {
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 20,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
