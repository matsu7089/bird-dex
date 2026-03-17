import './index.css';
import { render } from 'solid-js/web';
import { createResource } from 'solid-js';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { RouterProvider, createRouter } from '@tanstack/solid-router';
import { routeTree } from './routeTree.gen';
import { apiFetch } from './lib/api';
import type { UserDto } from './lib/queries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const [auth, { refetch: refetchAuth }] = createResource<UserDto | null>(async () => {
  try {
    return await apiFetch<UserDto>('/auth/me');
  } catch {
    return null;
  }
});

const router = createRouter({
  routeTree,
  context: { queryClient, auth, refetchAuth },
  defaultPreload: 'intent',
});

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  ),
  root,
);
