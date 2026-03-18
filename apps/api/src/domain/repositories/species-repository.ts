import type { Species, SpeciesWithCount } from "../entities/species.js";

export interface ISpeciesRepository {
  findAllByUserId(userId: string): Promise<SpeciesWithCount[]>;
  findById(id: string, userId: string): Promise<Species | null>;
  create(data: {
    userId: string;
    name: string;
    description?: string | null;
    sortOrder?: number;
  }): Promise<Species>;
  update(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string | null;
      sortOrder?: number;
      bestPhotoId?: string | null;
    },
  ): Promise<Species>;
  setBestPhoto(id: string, userId: string, photoId: string | null): Promise<Species>;
  delete(id: string, userId: string): Promise<void>;
  existsByName(userId: string, name: string, excludeId?: string): Promise<boolean>;
}
