import { createFileRoute, Link } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, For, Show } from 'solid-js';
import { fetchers, queryKeys } from '~/lib/queries';
import type { SightingQueryParams } from '~/lib/queries';
import { SightingCard } from '~/components/sightings/SightingCard';
import { Button } from '~/components/ui/Button';
import { Pagination } from '~/components/ui/Pagination';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/sightings/')({
  component: SightingsListPage,
});

function SightingsListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = createSignal(1);
  const [from, setFrom] = createSignal('');
  const [to, setTo] = createSignal('');
  const [sort, setSort] = createSignal<'date_desc' | 'date_asc'>('date_desc');

  const params = (): SightingQueryParams => ({
    page: page(),
    limit: 20,
    from: from() || undefined,
    to: to() || undefined,
    sort: sort(),
  });

  const query = createQuery(() => ({
    queryKey: queryKeys.sightings(params()),
    queryFn: () => fetchers.sightingsList(params()),
  }));

  function resetPage() { setPage(1); }

  return (
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">観察記録</h1>
        <Link to="/sightings/new">
          <Button size="sm">+ 記録を追加</Button>
        </Link>
      </div>

      {/* Filters */}
      <div class="mb-4 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">開始日</label>
          <input
            type="date"
            value={from()}
            onInput={(e) => { setFrom(e.currentTarget.value); resetPage(); }}
            class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">終了日</label>
          <input
            type="date"
            value={to()}
            onInput={(e) => { setTo(e.currentTarget.value); resetPage(); }}
            class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">並び順</label>
          <select
            value={sort()}
            onChange={(e) => { setSort(e.currentTarget.value as 'date_desc' | 'date_asc'); resetPage(); }}
            class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="date_desc">新しい順</option>
            <option value="date_asc">古い順</option>
          </select>
        </div>
        <div class="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFrom(''); setTo(''); setSort('date_desc'); resetPage(); }}
          >
            リセット
          </Button>
        </div>
      </div>

      <Show when={query.isPending}>
        <div class="flex justify-center py-12"><Spinner /></div>
      </Show>
      <Show when={query.isError}>
        <p class="text-red-600">読み込みに失敗しました</p>
      </Show>
      <Show when={query.data}>
        {(data) => (
          <>
            <Show
              when={data().items.length > 0}
              fallback={
                <div class="py-12 text-center text-gray-500">
                  観察記録がありません。「記録を追加」から始めましょう。
                </div>
              }
            >
              <div class="flex flex-col gap-3">
                <For each={data().items}>{(s) => <SightingCard sighting={s} />}</For>
              </div>
              <Show when={data().total > data().limit}>
                <div class="mt-4">
                  <Pagination
                    page={page()}
                    total={data().total}
                    limit={data().limit}
                    onPageChange={setPage}
                  />
                </div>
              </Show>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
