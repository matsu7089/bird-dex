import type {
  Sighting,
  SightingWithPhotos,
  PaginatedResult,
  HeatmapPoint,
} from "../entities/sighting.js";

export interface SightingFilters {
  speciesId?: string;
  from?: string;
  to?: string;
  sort?: "date_desc" | "date_asc";
  page?: number;
  limit?: number;
}

export interface ISightingRepository {
  findAllByUserId(
    userId: string,
    filters: SightingFilters,
  ): Promise<PaginatedResult<SightingWithPhotos>>;
  findById(id: string, userId: string): Promise<SightingWithPhotos | null>;
  create(data: {
    userId: string;
    memo?: string | null;
    sightedAt: string;
    latitude: number;
    longitude: number;
    locationName?: string | null;
  }): Promise<Sighting>;
  update(
    id: string,
    userId: string,
    data: {
      memo?: string | null;
      sightedAt?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string | null;
    },
  ): Promise<Sighting>;
  delete(id: string, userId: string): Promise<void>;
  getHeatmapData(userId: string, speciesId?: string): Promise<HeatmapPoint[]>;
}
