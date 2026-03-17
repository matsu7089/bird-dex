import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';
import { apiFetch } from '~/lib/api';
import { fetchers, queryKeys } from '~/lib/queries';
import { LeafletMap } from '~/components/map/LeafletMap';
import { Input, Textarea } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/sightings/$sightingId_/edit')({
  component: SightingEditPage,
});

function SightingEditPage() {
  const sightingId = Route.useParams()().sightingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = createQuery(() => ({
    queryKey: queryKeys.sightingDetail(sightingId),
    queryFn: () => fetchers.sightingDetail(sightingId),
  }));

  return (
    <Show
      when={query.data}
      fallback={
        <Show when={query.isPending}>
          <div class="flex justify-center py-12"><Spinner /></div>
        </Show>
      }
    >
      {(sighting) => {
        const [sightedAt, setSightedAt] = createSignal(sighting().sightedAt);
        const [lat, setLat] = createSignal(parseFloat(sighting().latitude));
        const [lng, setLng] = createSignal(parseFloat(sighting().longitude));
        const [locationName, setLocationName] = createSignal(sighting().locationName ?? '');
        const [memo, setMemo] = createSignal(sighting().memo ?? '');
        const [error, setError] = createSignal('');
        const [loading, setLoading] = createSignal(false);

        async function handleSubmit(e: Event) {
          e.preventDefault();
          setError('');
          setLoading(true);
          try {
            await apiFetch(`/api/sightings/${sightingId}`, {
              method: 'PUT',
              body: JSON.stringify({
                sightedAt: sightedAt(),
                latitude: lat(),
                longitude: lng(),
                locationName: locationName().trim() || null,
                memo: memo().trim() || null,
              }),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.sightingDetail(sightingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sightings({}) });
            navigate({ to: '/sightings/$sightingId', params: { sightingId } });
          } catch (err) {
            setError(err instanceof Error ? err.message : '保存に失敗しました');
          } finally {
            setLoading(false);
          }
        }

        return (
          <div class="max-w-2xl">
            <h1 class="mb-6 text-2xl font-bold">観察記録を編集</h1>
            <form onSubmit={handleSubmit} class="flex flex-col gap-5">
              <Input
                id="sighted-at"
                label="観察日 *"
                type="date"
                value={sightedAt()}
                onInput={(e) => setSightedAt(e.currentTarget.value)}
              />

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  撮影場所（クリックで変更）
                </label>
                <LeafletMap
                  center={[lat(), lng()]}
                  zoom={12}
                  onMapClick={(la, lo) => { setLat(la); setLng(lo); }}
                  class="h-64 w-full rounded-xl overflow-hidden border border-gray-200"
                />
                <p class="mt-1 text-xs text-gray-500">
                  緯度: {lat().toFixed(5)}, 経度: {lng().toFixed(5)}
                </p>
              </div>

              <Input
                id="location-name"
                label="場所名"
                value={locationName()}
                onInput={(e) => setLocationName(e.currentTarget.value)}
                placeholder="例: 東京都 新宿御苑"
              />

              <Textarea
                id="memo"
                label="メモ"
                value={memo()}
                onInput={(e) => setMemo(e.currentTarget.value)}
                rows="3"
              />

              {error() && <p class="text-sm text-red-600">{error()}</p>}

              <div class="flex gap-3">
                <Button type="submit" disabled={loading()}>
                  {loading() ? '保存中…' : '保存'}
                </Button>
                <Button variant="ghost" type="button" onClick={() => history.back()}>
                  キャンセル
                </Button>
              </div>
            </form>
          </div>
        );
      }}
    </Show>
  );
}
