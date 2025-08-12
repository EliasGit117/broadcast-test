import React, { createContext, useContext, ReactNode } from 'react';
import { useCollaborativeSession } from '@/hooks/collaborative/use-collaborative-session';

interface CollaborativeSessionContextValue extends ReturnType<typeof useCollaborativeSession> {}

const CollaborativeSessionContext = createContext<CollaborativeSessionContextValue | undefined>(undefined);

interface CollaborativeSessionProviderProps {
  children: ReactNode;
}

export const CollaborativeSessionProvider = ({ children }: CollaborativeSessionProviderProps) => {
  const session = useCollaborativeSession();

  return (
    <CollaborativeSessionContext.Provider value={session}>
      {children}
    </CollaborativeSessionContext.Provider>
  );
};

export const useCollaborativeSessionContext = (): CollaborativeSessionContextValue => {
  const context = useContext(CollaborativeSessionContext);
  if (!context) {
    throw new Error('useCollaborativeSessionContext must be used within a CollaborativeSessionProvider');
  }
  return context;
};
