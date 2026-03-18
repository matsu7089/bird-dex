import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { PaginatedPhotos } from "../../domain/entities/photo.js";

export class SpeciesNotFoundError extends Error {}

export class GetSpeciesGallery {
  constructor(
    private readonly speciesRepository: ISpeciesRepository,
    private readonly photoRepository: IPhotoRepository,
  ) {}

  async execute(
    userId: string,
    speciesId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedPhotos> {
    const sp = await this.speciesRepository.findById(speciesId, userId);
    if (!sp) throw new SpeciesNotFoundError(`Species not found: ${speciesId}`);

    return this.photoRepository.findBySpeciesId(speciesId, userId, page, limit);
  }
}
