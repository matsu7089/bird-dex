import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { createSignal, Show } from "solid-js";
import { apiFetch, apiUpload } from "~/lib/api";
import { fetchers, queryKeys } from "~/lib/queries";
import type { Sighting } from "~/lib/queries";
import { LeafletMap } from "~/components/map/LeafletMap";
import { PhotoUploadArea } from "~/components/sightings/PhotoUploadArea";
import type { PendingPhoto, ExifData } from "~/components/sightings/PhotoUploadArea";
import { Input, Textarea } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";

export const Route = createFileRoute("/sightings/new")({
  component: SightingNewPage,
});

function SightingNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const speciesQuery = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const [sightedAt, setSightedAt] = createSignal(today);
  const [lat, setLat] = createSignal(35.6895);
  const [lng, setLng] = createSignal(139.6917);
  const [locationName, setLocationName] = createSignal("");
  const [memo, setMemo] = createSignal("");
  const [photos, setPhotos] = createSignal<PendingPhoto[]>([]);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  function handleExif(data: ExifData) {
    if (data.date) setSightedAt(data.date);
    if (data.lat !== undefined) setLat(data.lat);
    if (data.lng !== undefined) setLng(data.lng);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!sightedAt()) {
      setError("日付を入力してください");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const sighting = await apiFetch<Sighting>("/api/sightings", {
        method: "POST",
        body: JSON.stringify({
          sightedAt: sightedAt(),
          latitude: lat(),
          longitude: lng(),
          locationName: locationName().trim() || null,
          memo: memo().trim() || null,
        }),
      });

      // Upload photos sequentially
      for (const [index, p] of photos().entries()) {
        const fd = new FormData();
        fd.append("file", p.file);
        fd.append("species_id", p.speciesId);
        fd.append("sort_order", String(index));
        await apiUpload(`/api/sightings/${sighting.id}/photos`, fd);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.sightings({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.species() });
      navigate({ to: "/sightings/$sightingId", params: { sightingId: sighting.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold">観察記録を追加</h1>
      <form onSubmit={handleSubmit} class="flex flex-col gap-5">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            写真
          </label>
          <Show
            when={speciesQuery.data && speciesQuery.data.length > 0}
            fallback={
              <p class="text-sm text-gray-500">
                写真を追加するには先に
                <a href="/species" class="text-emerald-600 underline">
                  図鑑に種を登録
                </a>
                してください。
              </p>
            }
          >
            <PhotoUploadArea
              speciesList={speciesQuery.data!}
              value={photos()}
              onChange={setPhotos}
              onExifFound={handleExif}
            />
          </Show>
        </div>

        <Input
          id="sighted-at"
          label="観察日 *"
          type="date"
          value={sightedAt()}
          onInput={(e) => setSightedAt(e.currentTarget.value)}
        />

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            撮影場所をクリックして選択
          </label>
          <LeafletMap
            center={[lat(), lng()]}
            zoom={10}
            onMapClick={(la, lo) => {
              setLat(la);
              setLng(lo);
            }}
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
          placeholder="観察メモ（省略可）"
          rows="3"
        />

        {error() && <p class="text-sm text-red-600">{error()}</p>}

        <div class="flex gap-3">
          <Button type="submit" disabled={loading()}>
            {loading() ? (
              <>
                <Spinner class="h-4 w-4" /> 保存中…
              </>
            ) : (
              "保存"
            )}
          </Button>
          <Button variant="ghost" type="button" onClick={() => history.back()}>
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
