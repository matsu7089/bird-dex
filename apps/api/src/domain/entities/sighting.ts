import type { PhotoWithSpecies } from './photo.js';

export type { PhotoWithSpecies };

export interface Sighting {
  id: string;
  userId: string;
  memo: string | null;
  sightedAt: string;       // DATE → drizzle returns string 'YYYY-MM-DD'
  latitude: string;        // DECIMAL → drizzle returns string
  longitude: string;
  locationName: string | null;
  createdAt: Date;
  updatedAt: Date;
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
