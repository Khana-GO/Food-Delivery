import { api } from '@/lib/axios';
import { ChatContext } from '@/types/chat.types';

export const aiService = {
  // ─── SEND MESSAGE ───
  sendMessage: async (
    message: string,
    sessionId?: string,
    context?: ChatContext,
  ): Promise<{ response: string; quickReplies?: string[]; intent?: string; sessionId: string }> => {
    const payload: Record<string, any> = { message };
    if (sessionId) payload.sessionId = sessionId;
    if (context && (context.restaurantId || context.orderId || context.location)) {
      payload.context = context;
    }
    const response = await api.post('/ai/chat', payload);
    return response.data;
  },

  // ─── CLEAR SESSION ───
  clearSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/ai/session/${sessionId}`);
  },

  // ─── GET SESSION HISTORY ───
  getSession: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/ai/session/${sessionId}`);
    return response.data;
  },
};