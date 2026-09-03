import { ChatMessage } from '@food_delivery/types';
import { create } from 'zustand';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  isTyping: boolean;
  error: string | null;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string, quickReplies?: string[]) => void;
  setIsTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  setSessionId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sessionId: null,
  isTyping: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateLastMessage: (content, quickReplies) =>
    set((state) => {
      const lastIndex = state.messages.length - 1;
      if (lastIndex < 0) return state;
      const updatedMessages = [...state.messages];
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        content,
        quickReplies,
        isLoading: false,
        error: false as any,
      };
      return { messages: updatedMessages };
    }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null, isTyping: false }),
  setSessionId: (id) => set({ sessionId: id }),
}));