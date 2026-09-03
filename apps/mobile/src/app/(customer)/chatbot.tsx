import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChat } from '@/hooks/customer/useChat';
import { ChatMessage } from '@/components/customer/ChatMessage';
import { ChatInput } from '@/components/customer/ChatInput';
import { QuickReplies } from '@/components/customer/QuickReplies';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function ChatbotScreen() {
  const { restaurantId, orderId } = useLocalSearchParams<{
    restaurantId?: string;
    orderId?: string;
  }>();

  const { messages, isTyping, isSending, sendMessage, clearChat } = useChat();
  const flatListRef = useRef<FlatList>(null);
  const hasAutoSent = useRef(false);

  // ─── Build context from URL params – send only once ───
  useEffect(() => {
    if ((restaurantId || orderId) && !hasAutoSent.current) {
      hasAutoSent.current = true;
      const text = restaurantId
        ? 'Tell me about this restaurant – is it open, what is the menu and delivery time?'
        : 'Can you help me track this order? What is its current status?';
      // Small delay to let store initialize
      const t = setTimeout(() => {
        sendMessage(text, { restaurantId, orderId } as any);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [restaurantId, orderId, sendMessage]);

  // ─── Scroll to bottom on new messages ───
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [messages]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const quickReplies = lastMessage?.quickReplies || [];

  const handleQuickReply = (reply: string) => {
    const ctx = restaurantId || orderId ? { restaurantId, orderId } as any : undefined;
    sendMessage(reply, ctx);
  };

  const handleClear = () => {
    Alert.alert('Clear chat', 'Are you sure you want to clear the conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearChat() },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* ─── Header – premium dark/white matching app design ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.85}>
            <Feather name="arrow-left" size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>KhanaGo AI</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Food assistant • Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.trashBtn} activeOpacity={0.8}>
          <Feather name="trash-2" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* ─── Messages ─── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Feather name="message-circle" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Ask me anything!</Text>
            <Text style={styles.emptyDesc}>I can help you find restaurants, check menus, track orders, and more.</Text>
            <View style={styles.emptyChips}>
              <TouchableOpacity style={styles.emptyChip} onPress={() => sendMessage('Show popular restaurants')}><Text style={styles.emptyChipText}>Popular restaurants</Text></TouchableOpacity>
              <TouchableOpacity style={styles.emptyChip} onPress={() => sendMessage('Find momo near me')}><Text style={styles.emptyChipText}>Find momo</Text></TouchableOpacity>
              <TouchableOpacity style={styles.emptyChip} onPress={() => sendMessage('Track my order')}><Text style={styles.emptyChipText}>Track order</Text></TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingWrap}>
              <View style={styles.typingBubble}>
                <View style={styles.dotsRow}>
                  <View style={[styles.dot, { opacity: 0.3 }]} />
                  <View style={[styles.dot, { opacity: 0.6 }]} />
                  <View style={[styles.dot, { opacity: 0.9 }]} />
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* ─── Quick Replies ─── */}
      {quickReplies.length > 0 && !isTyping && (
        <View style={styles.quickWrap}>
          <QuickReplies replies={quickReplies} onSelect={handleQuickReply} isDisabled={isSending} />
        </View>
      )}

      {/* ─── Input ─── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ChatInput onSend={(t) => sendMessage(t, restaurantId || orderId ? { restaurantId, orderId } as any : undefined)} isSending={isSending} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    ...Shadow.xs,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800' as const, color: Colors.textDark, letterSpacing: -0.3 },
  betaBadge: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  betaText: { fontSize: 10, fontWeight: '700' as const, color: Colors.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: 11, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' as const },
  trashBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  list: { flex: 1 },
  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 64, paddingHorizontal: 24 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700' as const, color: Colors.textDark },
  emptyDesc: { marginTop: 6, fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
  emptyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' },
  emptyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  emptyChipText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textDark },
  quickWrap: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: Colors.background },
  typingWrap: { alignItems: 'flex-start', marginBottom: 12 },
  typingBubble: {
    backgroundColor: Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Shadow.xs,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textTertiary },
});
