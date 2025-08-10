import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useBroadcastChannel } from 'react-broadcast-sync';
import {
  MessageType,
  CounterUpdateSchema
} from '@/hooks/collaborative/types';
import { user } from './consts';

const channelKey = 'counter';
const lastClickedKey = 'last-clicked';

export const useSharedCounter = () => {
  const [count, setCount] = useState<number>(getInitialCount);
  const [lastClickedById, setLastClickedById] = useState<string | undefined>(getInitialUserId());

  const { messages, postMessage } = useBroadcastChannel(channelKey, {
    keepLatestMessage: true,
    sourceName: user.id,
    namespace: channelKey
  });

  useEffect(() => {
    const lastMsg = messages.at(-1);
    if (!lastMsg) return;

    if (lastMsg.source === user.id)
      return;

    if (lastMsg.type === MessageType.CounterUpdate) {
      const parseResult = CounterUpdateSchema.safeParse(lastMsg.message);
      if (!parseResult.success) {
        console.warn('Invalid CounterUpdate message:', parseResult.error);
        return;
      }

      const { count: newCount } = parseResult.data;

      if (typeof newCount === 'number') {
        setCount(newCount);
        setLastClickedById(lastMsg.source);
        localStorage.setItem(channelKey, String(newCount));
      }
    }
  }, [messages]);

  const increment = () => {
    setCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(channelKey, String(next));
      postMessage(
        MessageType.CounterUpdate, { userId: user.id, action: 'increment', count: next }, { expirationDuration: 250 }
      );
      setLastClickedById(user.id);
      localStorage.setItem(lastClickedKey, user.id);
      return next;
    });
  };

  const decrement = () => {
    setCount((prev) => {
      const next = prev - 1;
      localStorage.setItem(channelKey, String(next));
      postMessage(MessageType.CounterUpdate, { userId: user.id, action: 'decrement', count: next }, { expirationDuration: 250 });
      setLastClickedById(user.id);
      localStorage.setItem(lastClickedKey, user.id);
      return next;
    });
  };

  const reset = () => {
    setCount(0);
    localStorage.setItem(channelKey, '0');
    postMessage(
      MessageType.CounterUpdate, { userId: user.id, action: 'set', count: 0 }, { expirationDuration: 250 }
    );
    setLastClickedById(user.id);
    localStorage.setItem(lastClickedKey, user.id);
  };


  return { count, increment, decrement, lastClickedById, resetCounter: reset };
};

const IntegerSchema = z.preprocess((val) => Number(val), z.number().int());

const getInitialCount = () => {
  const raw = localStorage.getItem(channelKey);
  const result = IntegerSchema.safeParse(raw);
  return result.success ? result.data : 0;
};

const getInitialUserId = () => {
  const raw = localStorage.getItem(lastClickedKey);
  const result = z.string().safeParse(raw);
  return result.success ? result.data : undefined;
};