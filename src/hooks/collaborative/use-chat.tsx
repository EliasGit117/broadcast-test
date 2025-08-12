import { useCallback, useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from 'react-broadcast-sync';
import {
  MessageType,
  ChatMessageSchema,
  DeleteMessageSchema,
  TypingIndicatorSchema,
  TChatMessageSchema,
  TTypingIndicatorSchema
} from '@/hooks/collaborative/types';
import { user } from '@/hooks/collaborative/consts';

const channelKey = 'chat';
const typingTimeoutDuration = 3000; // 3 seconds
const localStorageKey = 'chat';

function loadFromStorage(): TChatMessageSchema[] {
  try {
    const raw = localStorage.getItem(localStorageKey);
    if (!raw) return [];
    const parsed: TChatMessageSchema[] = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((m) => !m.expiresAt || m.expiresAt > now);
  } catch {
    return [];
  }
}

function saveToStorage(messages: TChatMessageSchema[]) {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(messages));
  } catch {
  }
}

export const useChat = () => {
  const userId = user.id;

  const [messages, setMessages] = useState<TChatMessageSchema[]>(() => loadFromStorage());
  const [typingUsers, setTypingUsers] = useState<Record<string, TTypingIndicatorSchema>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { messages: broadcastMessages, postMessage } = useBroadcastChannel(channelKey, {
    keepLatestMessage: true,
    sourceName: userId,
    namespace: channelKey
  });

  const reset = () => {
    clear();
    postMessage(MessageType.ClearChat, {}, { expirationDuration: 250 });
  }

  const clear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(localStorageKey);
  }, [postMessage]);

  useEffect(() => {
    const lastMsg = broadcastMessages.at(-1);
    if (!lastMsg || lastMsg.source === userId) return;

    console.log(lastMsg.type)

    switch (lastMsg.type) {
      case MessageType.ChatMessage: {
        const parsed = ChatMessageSchema.safeParse(lastMsg.message);
        if (!parsed.success) return;
        const newMessage = parsed.data;
        if (newMessage.expiresAt && newMessage.expiresAt < Date.now()) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage];
          saveToStorage(updated);
          return updated;
        });
        break;
      }

      case MessageType.DeleteMessage: {
        const parsed = DeleteMessageSchema.safeParse(lastMsg.message);
        if (!parsed.success) return;
        const { messageId } = parsed.data;
        setMessages((prev) => {
          const updated = prev.filter((msg) => msg.id !== messageId);
          saveToStorage(updated);
          return updated;
        });
        break;
      }

      case MessageType.TypingIndicator: {
        const parsed = TypingIndicatorSchema.safeParse(lastMsg.message);
        if (!parsed.success) return;
        const typingData = parsed.data;
        setTypingUsers((prev) => {
          if (typingData.isTyping) {
            return { ...prev, [typingData.userId]: typingData };
          } else {
            const copy = { ...prev };
            delete copy[typingData.userId];
            return copy;
          }
        });
        break;
      }

      case MessageType.ClearChat: {
        console.log('clear')
        clear();
        break;
      }

    }
  }, [broadcastMessages, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.expiresAt || msg.expiresAt > now);
        if (filtered.length !== prev.length) saveToStorage(filtered);
        return filtered;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(
    (text: string, expirationMinutes?: number) => {
      const newMessage: TChatMessageSchema = {
        id: `${userId}-${Date.now()}`,
        userId,
        text,
        timestamp: Date.now(),
        expiresAt: expirationMinutes ? Date.now() + expirationMinutes * 60 * 1000 : undefined
      };
      setMessages((prev) => [...prev, newMessage]); // don't save here, only on incoming
      postMessage(MessageType.ChatMessage, newMessage, { expirationDuration: 250 });
    },
    [postMessage, userId]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || message.userId !== userId) return;
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId)); // save only on incoming delete
      postMessage(MessageType.DeleteMessage, { messageId, userId },  { expirationDuration: 250 });
    },
    [messages, postMessage, userId]
  );

  const markTyping = useCallback(
    (isTyping: boolean) => {
      const typingData: TTypingIndicatorSchema = { userId, isTyping, timestamp: Date.now() };
      postMessage(MessageType.TypingIndicator, typingData, { expirationDuration: 250 });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          postMessage(
            MessageType.TypingIndicator,
            { userId, isTyping: false, timestamp: Date.now() },
            { expirationDuration: 250 }
          );
        }, typingTimeoutDuration);
      }
    },
    [postMessage, userId]
  );

  const typingUsersList = Object.values(typingUsers).filter((t) => t.userId !== userId && t.isTyping);

  return {
    messages,
    sendMessage,
    deleteMessage,
    markTyping,
    typingUsers: typingUsersList,
    resetChat: reset,
  };
};
