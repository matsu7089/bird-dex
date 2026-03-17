import { createRootRouteWithContext, Outlet, A } from '@tanstack/solid-router';
import type { QueryClient } from '@tanstack/solid-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <nav style={{ padding: '1rem', 'border-bottom': '1px solid #e5e7eb', display: 'flex', 'align-items': 'center', gap: '1rem' }}>
        <A href="/" style={{ 'font-weight': 'bold', 'font-size': '1.25rem', 'text-decoration': 'none', color: 'inherit' }}>
          BirdDex
        </A>
        <A href="/species" style={{ 'text-decoration': 'none', color: '#6b7280' }}>図鑑</A>
        <A href="/sightings" style={{ 'text-decoration': 'none', color: '#6b7280' }}>観察記録</A>
        <A href="/map" style={{ 'text-decoration': 'none', color: '#6b7280' }}>ヒートマップ</A>
      </nav>
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
