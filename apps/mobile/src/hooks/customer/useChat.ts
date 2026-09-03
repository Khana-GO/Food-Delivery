import { useState, useCallback } from 'react';
import { aiService } from '@/services/ai/ai.service';
import { useChatStore } from '@/stores/customer/chatStore';
import { ChatContext } from '@/types/chat.types';

export const useChat = () => {
  const { messages, sessionId, isTyping, addMessage, updateLastMessage, setIsTyping, setError, setSessionId } =
    useChatStore();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (message: string, context?: ChatContext) => {
      if (!message.trim() || isSending) return;

      // Add user message
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      // Add loading message
      const loadingMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };
      addMessage(loadingMessage);

      setIsSending(true);
      setIsTyping(true);
      setError(null);

      try {
        const response = await aiService.sendMessage(
          message,
          sessionId || undefined,
          context,
        );

        // Update loading message with response
        updateLastMessage(response.response, response.quickReplies);

        // Save session ID
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || 'Failed to get response';
        updateLastMessage(`Sorry, I encountered an error: ${errorMsg}`);
        setError(errorMsg);
      } finally {
        setIsSending(false);
        setIsTyping(false);
      }
    },
    [addMessage, updateLastMessage, setIsTyping, setError, isSending, sessionId, setSessionId],
  );

  const clearChat = useCallback(async () => {
    if (sessionId) {
      try {
        await aiService.clearSession(sessionId);
      } catch (error) {
        console.warn('Failed to clear session:', error);
      }
    }
    useChatStore.getState().clearMessages();
    setSessionId(null);
  }, [sessionId, setSessionId]);

  return {
    messages,
    isTyping,
    isSending,
    sessionId,
    sendMessage,
    clearChat,
  };
};