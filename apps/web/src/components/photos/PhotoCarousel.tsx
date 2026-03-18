import { createSignal, Show } from "solid-js";
import type { PhotoWithSpecies } from "~/lib/queries";
import { Button } from "~/components/ui/Button";

interface PhotoCarouselProps {
  photos: PhotoWithSpecies[];
  onDelete?: (id: string) => void;
}

export function PhotoCarousel(props: PhotoCarouselProps) {
  const [index, setIndex] = createSignal(0);
  const current = () => props.photos[index()];

  return (
    <Show
      when={props.photos.length > 0}
      fallback={
        <div class="flex h-48 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-3xl">
          🐦
        </div>
      }
    >
      <div class="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
        <img
          src={current().blobUrl}
          alt={current().speciesName}
          class="max-h-96 w-full object-contain"
        />
        <div class="absolute bottom-0 inset-x-0 flex items-center justify-between bg-black/40 px-4 py-2 text-white">
          <div>
            <p class="text-sm font-medium">{current().speciesName}</p>
            <p class="text-xs text-gray-300">
              {index() + 1} / {props.photos.length}
            </p>
          </div>
          <div class="flex gap-2">
            {props.onDelete && (
              <button
                onClick={() => {
                  if (confirm("この写真を削除しますか？")) props.onDelete!(current().id);
                }}
                class="rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
              >
                削除
              </button>
            )}
          </div>
        </div>
        <Show when={props.photos.length > 1}>
          <Button
            variant="ghost"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
            disabled={index() === 0}
            onClick={() => setIndex(index() - 1)}
          >
            ‹
          </Button>
          <Button
            variant="ghost"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
            disabled={index() === props.photos.length - 1}
            onClick={() => setIndex(index() + 1)}
          >
            ›
          </Button>
        </Show>
      </div>
    </Show>
  );
}
