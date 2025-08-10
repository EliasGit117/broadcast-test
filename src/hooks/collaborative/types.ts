import { z } from 'zod';

export enum MessageType {
  SayHello = 'say-hello',
  CounterUpdate = 'counter-update',
  ChatMessage = 'chat-message',
  DeleteMessage = 'delete-message',
  TypingIndicator = 'typing-indicator',
  ClearChat = 'clear-chat',
  ClearUsers = 'clear-users',
  ClearCounter = 'clear-counter',
}

export type TTheme = 'dark' | 'light' | 'system';

export const TabUserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CounterUpdateSchema = z.object({
  userId: z.string(),
  action: z.enum(['increment', 'decrement']),
  count: z.number().int().optional(), // optional count if you want to send full state sometimes
});

export const SayHello = z.object({
  user: TabUserSchema
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  timestamp: z.number(),
  expiresAt: z.number().optional(),
});

export const DeleteMessageSchema = z.object({
  messageId: z.string(),
  userId: z.string(),
});

export const TypingIndicatorSchema = z.object({
  userId: z.string(),
  isTyping: z.boolean(),
  timestamp: z.number(),
});

export type TTabUserSchema = z.infer<typeof TabUserSchema>;
export type TRegisterSchema = z.infer<typeof SayHello>;
export type TCounterUpdateSchema = z.infer<typeof CounterUpdateSchema>;
export type TChatMessageSchema = z.infer<typeof ChatMessageSchema>;
export type TDeleteMessageSchema = z.infer<typeof DeleteMessageSchema>;
export type TTypingIndicatorSchema = z.infer<typeof TypingIndicatorSchema>;

export const ThemeUpdateSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  timestamp: z.number(),
});

export type TThemeUpdateSchema = z.infer<typeof ThemeUpdateSchema>;