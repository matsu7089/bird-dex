import { For, Show } from 'solid-js';
import type { PhotoWithSpecies } from '~/lib/queries';
import { formatDate } from '~/lib/utils';

interface PhotoGridProps {
  photos: PhotoWithSpecies[];
  onDelete?: (id: string) => void;
}

export function PhotoGrid(props: PhotoGridProps) {
  return (
    <Show
      when={props.photos.length > 0}
      fallback={<p class="text-sm text-gray-500">写真がありません</p>}
    >
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <For each={props.photos}>
          {(photo) => (
            <div class="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img
                src={photo.thumbnailUrl ?? photo.blobUrl}
                alt={photo.speciesName}
                class="aspect-square w-full object-cover"
                loading="lazy"
              />
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p class="truncate text-xs font-medium">{photo.speciesName}</p>
                <p class="text-xs text-gray-300">{formatDate(photo.sightedAt)}</p>
              </div>
              {props.onDelete && (
                <button
                  onClick={() => props.onDelete!(photo.id)}
                  class="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  削除
                </button>
              )}
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}
