import { apiFetch } from './api';

// ---- Domain types ----

export interface UserDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Species {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  bestPhotoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpeciesWithCount extends Species {
  photoCount: number;
  bestPhotoThumbnailUrl: string | null;
  bestPhotoBlobUrl: string | null;
}

export interface Photo {
  id: string;
  sightingId: string;
  speciesId: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  originalFilename: string;
  sortOrder: number;
  createdAt: string;
}

export interface PhotoWithSpecies extends Photo {
  speciesName: string;
  sightedAt: string;
}

export interface PaginatedPhotos {
  items: PhotoWithSpecies[];
  total: number;
  page: number;
  limit: number;
}

export interface Sighting {
  id: string;
  userId: string;
  memo: string | null;
  sightedAt: string;
  latitude: string;
  longitude: string;
  locationName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SightingWithPhotos extends Sighting {
  photos: PhotoWithSpecies[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

// ---- Query key factory ----

export const queryKeys = {
  authMe: () => ['auth', 'me'] as const,
  species: () => ['species'] as const,
  speciesDetail: (id: string) => ['species', id] as const,
  speciesPhotos: (id: string, page: number) => ['species', id, 'photos', page] as const,
  sightings: (params: SightingQueryParams) => ['sightings', params] as const,
  sightingDetail: (id: string) => ['sightings', id] as const,
  heatmap: (speciesId?: string) => ['heatmap', speciesId] as const,
};

// ---- Typed fetchers ----

export interface SightingQueryParams {
  page?: number;
  limit?: number;
  species_id?: string;
  from?: string;
  to?: string;
  sort?: 'date_desc' | 'date_asc';
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const fetchers = {
  authMe: () => apiFetch<UserDto>('/auth/me'),
  speciesList: () => apiFetch<SpeciesWithCount[]>('/api/species'),
  speciesDetail: (id: string) => apiFetch<Species>(`/api/species/${id}`),
  speciesPhotos: (id: string, page = 1, limit = 20) =>
    apiFetch<PaginatedPhotos>(`/api/species/${id}/photos${buildQuery({ page, limit })}`),
  sightingsList: (params: SightingQueryParams = {}) =>
    apiFetch<PaginatedResult<SightingWithPhotos>>(`/api/sightings${buildQuery(params as Record<string, string | number | undefined>)}`),
  sightingDetail: (id: string) => apiFetch<SightingWithPhotos>(`/api/sightings/${id}`),
  heatmap: (speciesId?: string) =>
    apiFetch<HeatmapPoint[]>(`/api/sightings/heatmap${buildQuery({ species_id: speciesId })}`),
  setBestPhoto: (speciesId: string, photoId: string | null) =>
    apiFetch<Species>(`/api/species/${speciesId}/best-photo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    }),
};
