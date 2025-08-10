import { useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from 'react-broadcast-sync';
import { MessageType, SayHello, TRegisterSchema, TTabUserSchema } from '@/hooks/collaborative/types';
import { user } from '@/hooks/collaborative/consts';

const channelKey = 'users';

export const useSharedUsers = () => {
  const { messages, postMessage, ping } = useBroadcastChannel(channelKey, {
    keepLatestMessage: true,
    sourceName: user.id,
    cleaningInterval: 5000,
    namespace: channelKey
  });

  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [users, setUsers] = useState<Record<string, TTabUserSchema>>(() => {
    if (typeof window === 'undefined') {
      return { [user.id]: user };
    }

    try {
      const raw = localStorage.getItem(channelKey);
      if (!raw) return { [user.id]: user };

      const parsed = JSON.parse(raw) as Record<string, TTabUserSchema>;
      return { ...parsed, [user.id]: user };
    } catch (err) {
      console.error('useSharedUsers: failed to parse users from localStorage', err);
      return { [user.id]: user };
    }
  });
  const activeUsers = Object.values(users).filter(u => activeIds.includes(u.id));

  const clear = () => {
    setUsers(() => {
      const filteredUsers: Record<string, TTabUserSchema> = {};
      activeIds.forEach(id => {
        if (users[id]) {
          filteredUsers[id] = users[id];
        }
      });
      localStorage.setItem(channelKey, JSON.stringify(filteredUsers));

      return filteredUsers;
    });
  };

  const reset = () => {
    clear();
    postMessage(MessageType.ClearUsers, null, { expirationDuration: 250 });
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(channelKey, JSON.stringify(users));
    } catch (err) {
      console.error('useSharedUsers: failed to write users to localStorage', err);
    }
  }, [users]);


  useEffect(() => {
    const msg = messages.at(-1);
    if (!msg)
      return;

    if (msg.source === user.id)
      return;


    if (msg.type === MessageType.SayHello) {
      const { success, data } = SayHello.safeParse(msg.message);
      if (!success || !data)
        return;

      setUsers(pv => ({ ...pv, [data.user.id]: data.user }));
      return;
    }

    if (msg.type === MessageType.ClearUsers) {
      clear();
    }

  }, [messages]);

  useEffect(() => {
    const getActiveIds = async () => {
      const activeIds = await ping(300);
      setActiveIds([...activeIds]);
    };

    getActiveIds().then();

    const sub = setInterval(getActiveIds, 3000);

    return () => clearInterval(sub);
  }, []);

  useEffect(() => {
    postMessage(MessageType.SayHello, { user: user } satisfies TRegisterSchema, { expirationDuration: 250 });
  }, []);

  return {
    activeIds: activeIds,
    activeUsers: [user, ...activeUsers],
    users,
    resetUsers: reset,
  };
};