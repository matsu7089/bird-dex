import { createSignal, For, Show } from 'solid-js';
import type { SpeciesWithCount } from '~/lib/queries';
import { Button } from '~/components/ui/Button';

export interface PendingPhoto {
  file: File;
  speciesId: string;
  preview: string;
}

interface PhotoUploadAreaProps {
  speciesList: SpeciesWithCount[];
  value: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
}

export function PhotoUploadArea(props: PhotoUploadAreaProps) {
  const [dragging, setDragging] = createSignal(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const defaultSpeciesId = props.speciesList[0]?.id ?? '';
    const newPhotos: PendingPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        speciesId: defaultSpeciesId,
        preview: URL.createObjectURL(file),
      }));
    props.onChange([...props.value, ...newPhotos]);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(props.value[index].preview);
    props.onChange(props.value.filter((_, i) => i !== index));
  }

  function updateSpecies(index: number, speciesId: string) {
    props.onChange(
      props.value.map((p, i) => (i === index ? { ...p, speciesId } : p)),
    );
  }

  return (
    <div class="flex flex-col gap-3">
      <div
        class={`relative flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragging()
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 dark:border-gray-600 dark:bg-gray-800'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer?.files ?? null); }}
      >
        <label class="flex cursor-pointer flex-col items-center gap-1 p-6 text-center">
          <span class="text-2xl">📷</span>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            クリックまたはドラッグ&ドロップで写真を追加
          </span>
          <span class="text-xs text-gray-400">JPEG / PNG / WebP</span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => addFiles(e.currentTarget.files)}
          />
        </label>
      </div>

      <Show when={props.value.length > 0}>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <For each={props.value}>
            {(photo, i) => (
              <div class="flex flex-col gap-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="relative">
                  <img
                    src={photo.preview}
                    alt="preview"
                    class="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i())}
                    class="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
                <div class="p-1.5">
                  <select
                    value={photo.speciesId}
                    onChange={(e) => updateSpecies(i(), e.currentTarget.value)}
                    class="w-full rounded border border-gray-300 px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                  >
                    <For each={props.speciesList}>
                      {(s) => <option value={s.id}>{s.name}</option>}
                    </For>
                  </select>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
