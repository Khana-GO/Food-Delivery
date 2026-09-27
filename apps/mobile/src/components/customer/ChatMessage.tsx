import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  ChatMessage as ChatMessageType,
  normalizeChatTimestamp,
} from '@/types/chat.types';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { ChatCards } from '@/components/customer/ChatCards';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const ts = normalizeChatTimestamp(message.timestamp as any);
  const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderContent = () => {
    if (message.isLoading) {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>KhanaGo is checking...</Text>
        </View>
      );
    }

    if (isUser) {
      return <Text style={[styles.content, styles.contentUser]}>{message.content}</Text>;
    }

    if (message.error) {
      return <Text style={[styles.content, styles.contentError]}>{message.content}</Text>;
    }

    // Parse **bold** markdown segments for rich assistant typography
    const parts = (message.content || '').split(/(\*\*[^*]+\*\*)/g);

    return (
      <Text style={[styles.content, styles.contentAssistant]}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={styles.boldText}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, isUser ? styles.alignEnd : styles.alignStart]}>
      <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAssistant]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <Feather name="zap" size={13} color={Colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.bubbleUser
              : message.error
                ? styles.bubbleError
                : styles.bubbleAssistant,
          ]}
        >
          {renderContent()}
          {!message.isLoading && (
            <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>
              {time}
            </Text>
          )}
        </View>
      </View>
      {!isUser && !message.isLoading && !message.error && message.data ? (
        <View style={styles.cardsRow}>
          <ChatCards data={message.data} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10, width: '100%' },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', maxWidth: '86%', gap: 6 },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  cardsRow: { marginTop: 6, width: '86%', paddingLeft: 28 },
  avatarWrap: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    flexShrink: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    borderBottomRightRadius: 4,
    ...Shadow.sm,
  },
  bubbleAssistant: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
    ...Shadow.xs,
  },
  bubbleError: {
    backgroundColor: Colors.errorLight,
    borderColor: '#FECACA',
    borderBottomLeftRadius: 4,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  loadingText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const },
  content: { fontSize: 12.5, lineHeight: 18, fontWeight: '400' as const },
  contentUser: { color: '#FFF', fontWeight: '500' as const },
  contentAssistant: { color: Colors.textDark },
  boldText: { fontWeight: '700' as const, color: Colors.textDark },
  contentError: { color: Colors.error },
  time: { fontSize: 9, marginTop: 4, fontWeight: '500' as const },
  timeUser: { color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  timeAssistant: { color: Colors.textTertiary },
});