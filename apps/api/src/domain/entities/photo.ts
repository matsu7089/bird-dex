export interface Photo {
  id: string;
  sightingId: string;
  speciesId: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  originalFilename: string;
  sortOrder: number;
  cameraMake: string | null;
  cameraModel: string | null;
  fNumber: number | null;
  shutterSpeed: number | null;
  focalLength: number | null;
  iso: number | null;
  createdAt: Date;
}

export interface PhotoWithSpecies extends Photo {
  speciesName: string;
  sightedAt: string; // DATE string from sightings
}

export interface PaginatedPhotos {
  items: PhotoWithSpecies[];
  total: number;
  page: number;
  limit: number;
}
