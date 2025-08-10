import { useSharedCounter } from '@/hooks/collaborative/use-shared-counter';
import { useSharedUsers } from '@/hooks/collaborative/use-shared-users';
import { useChat } from '@/hooks/collaborative/use-chat';
import { user } from '@/hooks/collaborative/consts';

export const useCollaborativeSession = () => {
  const sharedUsersRes = useSharedUsers();
  const sharedCounterRes = useSharedCounter();
  const chatRes = useChat();

  return {
    ...sharedUsersRes,
    ...sharedCounterRes,
    ...chatRes,
    currentUser: user
  };
};
