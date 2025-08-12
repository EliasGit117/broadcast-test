import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { CollaborativeSessionProvider } from '@/hooks/collaborative/provider';
import ActiveUsers from './-components/active-users';
import SharedCounter from './-components/shared-counter';
import Chat from './-components/chat';
import { ClearButton } from '@/routes/-components/clear-button';

export const Route = createFileRoute('/')({
  component: Home
});

function Home() {
  return (
    <CollaborativeSessionProvider>
      <main className="container mx-auto p-4 space-y-2">
        <div className='flex items-center justify-between'>
          <div>
            <h1 className="text-3xl font-bold">Collaborative Session Demo</h1>
            <p className="text-muted-foreground">
              Open multiple tabs to see the collaborative features in action!
            </p>
          </div>
          <ClearButton/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <ActiveUsers/>
            <SharedCounter/>
          </div>
          <Chat/>
        </div>
      </main>
    </CollaborativeSessionProvider>
  );
}
