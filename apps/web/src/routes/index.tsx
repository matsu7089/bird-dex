import { createFileRoute, Link } from '@tanstack/solid-router';
import { createQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';
import { fetchers, queryKeys } from '~/lib/queries';
import { Spinner } from '~/components/ui/Spinner';
import { formatDate } from '~/lib/utils';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const speciesQuery = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  const sightingsQuery = createQuery(() => ({
    queryKey: queryKeys.sightings({ limit: 5, sort: 'date_desc' }),
    queryFn: () => fetchers.sightingsList({ limit: 5, sort: 'date_desc' }),
  }));

  const totalPhotos = () =>
    speciesQuery.data?.reduce((sum, s) => sum + s.photoCount, 0) ?? 0;

  return (
    <div class="flex flex-col gap-8">
      <div>
        <h1 class="text-3xl font-bold">ダッシュボード</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          BirdDex へようこそ。撮影した野鳥を記録して、自分だけの図鑑を作りましょう。
        </p>
      </div>

      {/* Stat cards */}
      <div class="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="登録種数"
          value={speciesQuery.isPending ? null : speciesQuery.data?.length ?? 0}
          icon="🦜"
          href="/species"
        />
        <StatCard
          label="観察記録数"
          value={sightingsQuery.isPending ? null : sightingsQuery.data?.total ?? 0}
          icon="📋"
          href="/sightings"
        />
        <StatCard
          label="総写真数"
          value={speciesQuery.isPending ? null : totalPhotos()}
          icon="📷"
          href="/map"
        />
      </div>

      {/* Recent sightings */}
      <div>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-xl font-semibold">最近の観察記録</h2>
          <Link to="/sightings" class="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
            すべて見る →
          </Link>
        </div>
        <Show when={sightingsQuery.isPending}>
          <div class="flex justify-center py-8"><Spinner /></div>
        </Show>
        <Show when={sightingsQuery.data}>
          {(data) => (
            <Show
              when={data().items.length > 0}
              fallback={
                <div class="rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-500">
                  まだ観察記録がありません。
                  <Link to="/sightings/new" class="ml-1 text-emerald-600 underline">記録を追加</Link>
                </div>
              }
            >
              <div class="flex flex-col gap-2">
                <For each={data().items}>
                  {(s) => (
                    <Link
                      to="/sightings/$sightingId"
                      params={{ sightingId: s.id }}
                      class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 no-underline"
                    >
                      <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        {s.photos[0] ? (
                          <img
                            src={s.photos[0].thumbnailUrl ?? s.photos[0].blobUrl}
                            alt=""
                            class="h-full w-full object-cover"
                          />
                        ) : (
                          <div class="flex h-full items-center justify-center text-xl">🐦</div>
                        )}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-medium text-gray-900 dark:text-gray-100">{formatDate(s.sightedAt)}</p>
                        {s.locationName && (
                          <p class="truncate text-sm text-gray-500">📍 {s.locationName}</p>
                        )}
                      </div>
                      <span class="text-sm text-gray-400">{s.photos.length}枚</span>
                    </Link>
                  )}
                </For>
              </div>
            </Show>
          )}
        </Show>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | null;
  icon: string;
  href: string;
}

function StatCard(props: StatCardProps) {
  return (
    <Link
      to={props.href as '/'}
      class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 no-underline"
    >
      <span class="text-3xl">{props.icon}</span>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{props.label}</p>
        {props.value === null ? (
          <Spinner class="h-5 w-5 mt-1" />
        ) : (
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{props.value}</p>
        )}
      </div>
    </Link>
  );
}
