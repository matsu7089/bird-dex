import { createFileRoute } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, For, onMount, onCleanup, Show } from 'solid-js';
import Sortable from 'sortablejs';
import { apiFetch } from '~/lib/api';
import { fetchers, queryKeys } from '~/lib/queries';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/species/manage')({
  component: SpeciesManagePage,
});

function SpeciesManagePage() {
  const queryClient = useQueryClient();
  const query = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  let tbodyRef!: HTMLTableSectionElement;
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');

  onMount(() => {
    const sortable = Sortable.create(tbodyRef, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async () => {
        const ids = Array.from(tbodyRef.querySelectorAll('tr[data-id]')).map(
          (el) => (el as HTMLElement).dataset.id!,
        );
        setSaving(true);
        setError('');
        try {
          await Promise.all(
            ids.map((id, index) =>
              apiFetch(`/api/species/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ sortOrder: index }),
              }),
            ),
          );
          queryClient.invalidateQueries({ queryKey: queryKeys.species() });
        } catch {
          setError('並び替えの保存に失敗しました');
        } finally {
          setSaving(false);
        }
      },
    });
    onCleanup(() => sortable.destroy());
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？（写真が紐づいている場合は削除できません）`)) return;
    try {
      await apiFetch(`/api/species/${id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: queryKeys.species() });
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }

  return (
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">種の管理</h1>
        <div class="flex items-center gap-3">
          {saving() && <span class="text-sm text-gray-500">保存中…</span>}
          {error() && <span class="text-sm text-red-600">{error()}</span>}
        </div>
      </div>
      <p class="mb-4 text-sm text-gray-500">行をドラッグして表示順を変更できます。</p>

      <Show when={query.isPending}>
        <div class="flex justify-center py-12"><Spinner /></div>
      </Show>
      <Show when={query.data}>
        <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="w-8 px-3 py-3"></th>
                <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">名前</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">写真数</th>
                <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">順序</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody ref={tbodyRef!} class="divide-y divide-gray-200 dark:divide-gray-700">
              <For each={query.data}>
                {(species) => (
                  <tr data-id={species.id} class="bg-white dark:bg-gray-900">
                    <td class="px-3 py-3">
                      <span class="drag-handle cursor-grab text-gray-400 select-none">⠿</span>
                    </td>
                    <td class="px-4 py-3 font-medium">{species.name}</td>
                    <td class="px-4 py-3 text-gray-500">{species.photoCount}枚</td>
                    <td class="px-4 py-3 text-gray-500">{species.sortOrder}</td>
                    <td class="px-4 py-3 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(species.id, species.name)}
                      >
                        削除
                      </Button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
}
