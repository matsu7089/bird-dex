import type { Photo, PhotoWithSpecies, PaginatedPhotos } from '../entities/photo.js';

export interface IPhotoRepository {
  findBySightingId(sightingId: string): Promise<PhotoWithSpecies[]>;
  findBySpeciesId(speciesId: string, userId: string, page: number, limit: number): Promise<PaginatedPhotos>;
  create(data: {
    sightingId: string;
    speciesId: string;
    blobUrl: string;
    thumbnailUrl?: string | null;
    originalFilename: string;
    sortOrder?: number;
  }): Promise<Photo>;
  findById(id: string): Promise<Photo | null>;
  update(id: string, data: { speciesId?: string }): Promise<Photo>;
  delete(id: string): Promise<void>;
}
