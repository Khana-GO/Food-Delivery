import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ChatMessage as ChatMessageType } from '@/types/chat.types';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { normalizeChatTimestamp } from '@/types/chat.types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const ts = normalizeChatTimestamp(message.timestamp as any);
  const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, isUser ? styles.alignEnd : styles.alignStart]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : message.error ? styles.bubbleError : styles.bubbleAssistant,
        ]}
      >
        {message.isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.content, isUser ? styles.contentUser : message.error ? styles.contentError : styles.contentAssistant]}>
              {message.content}
            </Text>
            <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>{time}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: '100%' },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleUser: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark, ...Shadow.sm },
  bubbleAssistant: { backgroundColor: Colors.white, borderColor: Colors.border, ...Shadow.xs },
  bubbleError: { backgroundColor: Colors.errorLight, borderColor: '#FECACA' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' as const },
  content: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  contentUser: { color: '#FFF' },
  contentAssistant: { color: Colors.textDark },
  contentError: { color: Colors.error },
  time: { fontSize: 10, marginTop: 6, fontWeight: '500' as const },
  timeUser: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  timeAssistant: { color: Colors.textTertiary },
});