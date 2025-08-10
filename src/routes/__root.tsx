import * as React from 'react';
import {
  Link,
  Outlet,
  createRootRouteWithContext
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/theme-provider';
import ThemeDropdown from '@/components/theme/theme-dropdown';
import { FlaskRoundIcon, GhostIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaborativeSessionProvider } from '@/hooks/collaborative/provider';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  }
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <CollaborativeSessionProvider>
        <header className="container mx-auto px-4 py-2 flex items-center">
          <Button variant="link" asChild>
            <Link to="/">
              <GhostIcon/>
              <span>Testing Task</span>
            </Link>
          </Button>
          <ThemeDropdown buttonVariant="ghost" className="ml-auto"/>
        </header>

        <Outlet/>
        {/*<ReactQueryDevtools buttonPosition="top-right" />*/}
        {/*<TanStackRouterDevtools position="bottom-right" />*/}
      </CollaborativeSessionProvider>
    </ThemeProvider>
  );
}
