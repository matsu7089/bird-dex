import { createFileRoute, Link } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { apiFetch, apiUpload } from '~/lib/api';
import { fetchers, queryKeys } from '~/lib/queries';
import { LeafletMap } from '~/components/map/LeafletMap';
import { PhotoGrid } from '~/components/photos/PhotoGrid';
import { PhotoUploadArea } from '~/components/sightings/PhotoUploadArea';
import type { PendingPhoto } from '~/components/sightings/PhotoUploadArea';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/ui/Spinner';
import { formatDate } from '~/lib/utils';

export const Route = createFileRoute('/sightings/$sightingId')({
  component: SightingDetailPage,
});

function SightingDetailPage() {
  const sightingId = Route.useParams()().sightingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = createQuery(() => ({
    queryKey: queryKeys.sightingDetail(sightingId),
    queryFn: () => fetchers.sightingDetail(sightingId),
  }));

  const speciesQuery = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  const [pendingPhotos, setPendingPhotos] = createSignal<PendingPhoto[]>([]);
  const [uploading, setUploading] = createSignal(false);
  const [uploadError, setUploadError] = createSignal('');

  async function handleDeletePhoto(photoId: string) {
    await apiFetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: queryKeys.sightingDetail(sightingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.species() });
  }

  async function handleUploadPhotos() {
    const pending = pendingPhotos();
    if (pending.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const baseOrder = (query.data?.photos.length ?? 0);
      for (const [i, p] of pending.entries()) {
        const fd = new FormData();
        fd.append('file', p.file);
        fd.append('species_id', p.speciesId);
        fd.append('sort_order', String(baseOrder + i));
        await apiUpload(`/api/sightings/${sightingId}/photos`, fd);
      }
      setPendingPhotos([]);
      queryClient.invalidateQueries({ queryKey: queryKeys.sightingDetail(sightingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.species() });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('この観察記録を削除しますか？（写真も削除されます）')) return;
    await apiFetch(`/api/sightings/${sightingId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: queryKeys.sightings({}) });
    navigate({ to: '/sightings' });
  }

  return (
    <div>
      <Show when={query.isPending}>
        <div class="flex justify-center py-12"><Spinner /></div>
      </Show>
      <Show when={query.data}>
        {(s) => (
          <div class="flex flex-col gap-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl font-bold">{formatDate(s().sightedAt)}</h1>
                {s().locationName && (
                  <p class="mt-1 text-gray-600 dark:text-gray-400">📍 {s().locationName}</p>
                )}
              </div>
              <div class="flex gap-2">
                <Link to="/sightings/$sightingId/edit" params={{ sightingId: s().id }}>
                  <Button variant="ghost" size="sm">編集</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={handleDelete}>削除</Button>
              </div>
            </div>

            {s().memo && (
              <p class="text-gray-700 dark:text-gray-300">{s().memo}</p>
            )}

            <PhotoGrid photos={s().photos} onDelete={handleDeletePhoto} />

            {/* Add more photos */}
            <Show when={speciesQuery.data && speciesQuery.data.length > 0}>
              <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <h2 class="mb-3 text-lg font-semibold">写真を追加</h2>
                <PhotoUploadArea
                  speciesList={speciesQuery.data!}
                  value={pendingPhotos()}
                  onChange={setPendingPhotos}
                />
                <Show when={pendingPhotos().length > 0}>
                  <div class="mt-3 flex items-center gap-3">
                    <Button onClick={handleUploadPhotos} disabled={uploading()}>
                      {uploading() ? 'アップロード中…' : `${pendingPhotos().length}枚をアップロード`}
                    </Button>
                    {uploadError() && <p class="text-sm text-red-600">{uploadError()}</p>}
                  </div>
                </Show>
              </div>
            </Show>

            {/* Map pin */}
            <div>
              <h2 class="mb-3 text-lg font-semibold">撮影場所</h2>
              <MapWithPin
                lat={parseFloat(s().latitude)}
                lng={parseFloat(s().longitude)}
              />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}

function MapWithPin(props: { lat: number; lng: number }) {
  return (
    <LeafletMap
      center={[props.lat, props.lng]}
      zoom={13}
      onMapReady={(map) => {
        import('leaflet').then((L) => {
          L.default.marker([props.lat, props.lng]).addTo(map);
        });
      }}
      class="h-64 w-full rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
