import React from 'react';
import { TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  isDisabled?: boolean;
}

export const QuickReplies = ({ replies, onSelect, isDisabled }: QuickRepliesProps) => {
  if (!replies || replies.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {replies.map((reply, index) => (
        <TouchableOpacity
          key={`${reply}-${index}`}
          style={[styles.chip, isDisabled && styles.chipDisabled]}
          onPress={() => onSelect(reply)}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          <Text style={styles.chipText}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { marginTop: 8 },
  content: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    ...Shadow.xs,
  },
  chipDisabled: { opacity: 0.5 },
  chipText: { fontSize: 13, fontWeight: '600' as const, color: Colors.primary, letterSpacing: 0.1 },
});