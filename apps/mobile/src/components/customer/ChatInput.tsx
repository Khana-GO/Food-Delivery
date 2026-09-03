import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  isSending: boolean;
}

export const ChatInput = ({ onSend, isSending }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText('');
  };

  const canSend = !!text.trim() && !isSending;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Ask about food, restaurants, orders..."
          placeholderTextColor={Colors.textTertiary}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          multiline
          editable={!isSending}
          maxLength={1000}
          returnKeyType="send"
          blurOnSubmit={false}
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.9}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Feather name="send" size={18} color={canSend ? '#FFF' : Colors.textTertiary} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '500' as const,
    maxHeight: 96,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  sendBtnActive: { backgroundColor: Colors.primary },
  sendBtnDisabled: { backgroundColor: Colors.backgroundAlt, borderWidth: 1, borderColor: Colors.border },
});