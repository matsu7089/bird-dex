import { Link } from '@tanstack/solid-router';
import { Show } from 'solid-js';
import type { SpeciesWithCount } from '~/lib/queries';
import { Badge } from '~/components/ui/Badge';

interface SpeciesCardProps {
  species: SpeciesWithCount;
}

export function SpeciesCard(props: SpeciesCardProps) {
  return (
    <Link
      to="/species/$speciesId"
      params={{ speciesId: props.species.id }}
      class="block rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 no-underline overflow-hidden"
    >
      <Show when={props.species.bestPhotoThumbnailUrl ?? props.species.bestPhotoBlobUrl}>
        {(url) => (
          <img
            src={url()}
            alt={props.species.name}
            class="h-32 w-full object-cover"
            loading="lazy"
          />
        )}
      </Show>
      <div class="p-4">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="truncate font-semibold text-gray-900 dark:text-gray-100">{props.species.name}</h3>
            {props.species.description && (
              <p class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {props.species.description}
              </p>
            )}
          </div>
          <Badge count={props.species.photoCount} />
        </div>
      </div>
    </Link>
  );
}
