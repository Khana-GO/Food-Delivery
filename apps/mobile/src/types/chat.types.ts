// Central chat types for frontend – re-export canonical types and add UI helpers
// This file resolves imports like '@/types/chat.types' used across components/services

export type {
  ChatMessage,
  ChatContext,
  ChatRequest,
  ChatResponse,
  ChatSession,
} from '@food_delivery/types';

// UI-specific helper: ensure timestamp normalization
export const normalizeChatTimestamp = (ts: Date | string): Date => {
  if (ts instanceof Date) return ts;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};
