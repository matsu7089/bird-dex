import { Link } from '@tanstack/solid-router';
import type { SightingWithPhotos } from '~/lib/queries';
import { formatDate } from '~/lib/utils';

interface SightingCardProps {
  sighting: SightingWithPhotos;
}

export function SightingCard(props: SightingCardProps) {
  const s = () => props.sighting;
  const firstPhoto = () => s().photos[0];

  return (
    <Link
      to="/sightings/$sightingId"
      params={{ sightingId: s().id }}
      class="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 no-underline"
    >
      <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        {firstPhoto() ? (
          <img
            src={firstPhoto().thumbnailUrl ?? firstPhoto().blobUrl}
            alt={firstPhoto().speciesName}
            class="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div class="flex h-full items-center justify-center text-3xl">🐦</div>
        )}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p class="font-semibold text-gray-900 dark:text-gray-100">{formatDate(s().sightedAt)}</p>
          <span class="text-xs text-gray-400">{s().photos.length}枚</span>
        </div>
        {s().locationName && (
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">📍 {s().locationName}</p>
        )}
        {s().memo && (
          <p class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{s().memo}</p>
        )}
        {s().photos.length > 0 && (
          <p class="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            {[...new Set(s().photos.map((p) => p.speciesName))].join('・')}
          </p>
        )}
      </div>
    </Link>
  );
}
