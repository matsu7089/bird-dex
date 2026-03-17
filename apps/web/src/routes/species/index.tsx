import { createFileRoute } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, For, Show } from 'solid-js';
import { Link } from '@tanstack/solid-router';
import { fetchers, queryKeys } from '~/lib/queries';
import { SpeciesCard } from '~/components/species/SpeciesCard';
import { SpeciesForm } from '~/components/species/SpeciesForm';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/species/')({
  component: SpeciesListPage,
});

function SpeciesListPage() {
  const queryClient = useQueryClient();
  const query = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  const [showForm, setShowForm] = createSignal(false);

  function onSaved() {
    queryClient.invalidateQueries({ queryKey: queryKeys.species() });
  }

  return (
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">図鑑</h1>
        <div class="flex gap-2">
          <Link to="/species/manage">
            <Button variant="ghost" size="sm">並び替え</Button>
          </Link>
          <Button size="sm" onClick={() => setShowForm(true)}>+ 種を追加</Button>
        </div>
      </div>

      <Show when={query.isPending}>
        <div class="flex justify-center py-12"><Spinner /></div>
      </Show>
      <Show when={query.isError}>
        <p class="text-red-600">読み込みに失敗しました</p>
      </Show>
      <Show when={query.data}>
        <Show
          when={(query.data?.length ?? 0) > 0}
          fallback={
            <div class="py-12 text-center text-gray-500">
              まだ種が登録されていません。「種を追加」から始めましょう。
            </div>
          }
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={query.data}>{(s) => <SpeciesCard species={s} />}</For>
          </div>
        </Show>
      </Show>

      <SpeciesForm
        open={showForm()}
        onClose={() => setShowForm(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
