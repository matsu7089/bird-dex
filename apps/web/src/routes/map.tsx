import { createFileRoute } from '@tanstack/solid-router';
import { createQuery } from '@tanstack/solid-query';
import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import type L from 'leaflet';
import { fetchers, queryKeys } from '~/lib/queries';
import { Spinner } from '~/components/ui/Spinner';

export const Route = createFileRoute('/map')({
  component: MapPage,
});

function MapPage() {
  const speciesQuery = createQuery(() => ({
    queryKey: queryKeys.species(),
    queryFn: fetchers.speciesList,
  }));

  const [selectedSpecies, setSelectedSpecies] = createSignal<string>('');

  const heatmapQuery = createQuery(() => ({
    queryKey: queryKeys.heatmap(selectedSpecies() || undefined),
    queryFn: () => fetchers.heatmap(selectedSpecies() || undefined),
  }));

  let containerRef!: HTMLDivElement;
  let mapInstance: L.Map | undefined;
  let heatLayer: L.Layer | undefined;

  onMount(async () => {
    const L = (await import('leaflet')).default;
    await import('leaflet.heat');

    mapInstance = L.map(containerRef).setView([36.5, 137.0], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance);

    onCleanup(() => mapInstance?.remove());
  });

  createEffect(async () => {
    const data = heatmapQuery.data;
    if (!mapInstance || !data) return;

    const L = (await import('leaflet')).default;

    if (heatLayer) {
      mapInstance.removeLayer(heatLayer);
    }

    const points: [number, number, number?][] = data.map((p) => [p.lat, p.lng, p.weight]);
    heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: '#3b82f6', 0.65: '#84cc16', 1: '#ef4444' },
    }).addTo(mapInstance);
  });

  return (
    <div>
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">ヒートマップ</h1>
        <Show when={speciesQuery.data}>
          <select
            value={selectedSpecies()}
            onChange={(e) => setSelectedSpecies(e.currentTarget.value)}
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">すべての種</option>
            <For each={speciesQuery.data}>
              {(s) => <option value={s.id}>{s.name}</option>}
            </For>
          </select>
        </Show>
      </div>

      <Show when={heatmapQuery.isPending}>
        <div class="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </div>
      </Show>

      <div
        ref={containerRef!}
        class="h-[calc(100vh-12rem)] w-full rounded-xl overflow-hidden border border-gray-200"
      />

      <p class="mt-2 text-xs text-gray-500">
        {heatmapQuery.data?.length ?? 0}件の撮影地点を表示中
      </p>
    </div>
  );
}
