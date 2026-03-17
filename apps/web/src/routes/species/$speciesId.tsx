import { createFileRoute } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';
import { apiFetch } from '~/lib/api';
import { fetchers, queryKeys } from '~/lib/queries';
import { SpeciesForm } from '~/components/species/SpeciesForm';
import { PhotoGrid } from '~/components/photos/PhotoGrid';
import { Button } from '~/components/ui/Button';
import { Pagination } from '~/components/ui/Pagination';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/species/$speciesId')({
  component: SpeciesDetailPage,
});

function SpeciesDetailPage() {
  const speciesId = Route.useParams()().speciesId;
  const queryClient = useQueryClient();
  const [page, setPage] = createSignal(1);
  const [showEdit, setShowEdit] = createSignal(false);

  const speciesQuery = createQuery(() => ({
    queryKey: queryKeys.speciesDetail(speciesId),
    queryFn: () => fetchers.speciesDetail(speciesId),
  }));

  const photosQuery = createQuery(() => ({
    queryKey: queryKeys.speciesPhotos(speciesId, page()),
    queryFn: () => fetchers.speciesPhotos(speciesId, page()),
  }));

  async function handleDeletePhoto(photoId: string) {
    if (!confirm('この写真を削除しますか？')) return;
    await apiFetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: queryKeys.speciesPhotos(speciesId, page()) });
    queryClient.invalidateQueries({ queryKey: queryKeys.species() });
  }

  function onSpeciesSaved() {
    queryClient.invalidateQueries({ queryKey: queryKeys.speciesDetail(speciesId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.species() });
  }

  return (
    <div>
      <Show when={speciesQuery.isPending}>
        <div class="flex justify-center py-12"><Spinner /></div>
      </Show>
      <Show when={speciesQuery.data}>
        {(species) => (
          <div>
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl font-bold">{species().name}</h1>
                {species().description && (
                  <p class="mt-1 text-gray-600 dark:text-gray-400">{species().description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>編集</Button>
            </div>

            <h2 class="mb-3 text-lg font-semibold">ギャラリー</h2>
            <Show when={photosQuery.isPending}>
              <div class="flex justify-center py-8"><Spinner /></div>
            </Show>
            <Show when={photosQuery.data}>
              {(data) => (
                <>
                  <PhotoGrid photos={data().items} onDelete={handleDeletePhoto} />
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
                </>
              )}
            </Show>

            <SpeciesForm
              open={showEdit()}
              onClose={() => setShowEdit(false)}
              onSaved={onSpeciesSaved}
              initial={species()}
            />
          </div>
        )}
      </Show>
    </div>
  );
}
