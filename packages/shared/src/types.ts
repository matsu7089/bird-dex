// ─── Generic API response wrappers ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Shared domain DTOs ───────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface SpeciesDto {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  photoCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SightingDto {
  id: string;
  userId: string;
  memo: string | null;
  sightedAt: string; // YYYY-MM-DD
  latitude: string;  // DECIMAL returned as string to avoid float imprecision
  longitude: string;
  locationName: string | null;
  photos: PhotoDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PhotoDto {
  id: string;
  sightingId: string;
  speciesId: string;
  speciesName?: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  originalFilename: string;
  sortOrder: number;
  createdAt: string;
}

export interface HeatmapPointDto {
  latitude: string;
  longitude: string;
  weight: number;
}
