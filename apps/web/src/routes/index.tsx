import { createFileRoute } from '@tanstack/solid-router';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>BirdDex へようこそ。撮影した野鳥を記録して、自分だけの図鑑を作りましょう。</p>
    </div>
  );
}
