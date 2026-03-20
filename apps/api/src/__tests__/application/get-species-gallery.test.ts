import { describe, it, expect, vi } from "vitest";
import {
  GetSpeciesGallery,
  SpeciesNotFoundError,
} from "../../application/use-cases/get-species-gallery.js";
import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { Species } from "../../domain/entities/species.js";
import type { PaginatedPhotos } from "../../domain/entities/photo.js";

function makeSpecies(): Species {
  return {
    id: "sp-1",
    userId: "user-1",
    name: "スズメ",
    description: null,
    sortOrder: 0,
    bestPhotoId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("GetSpeciesGallery", () => {
  it("種が存在すれば写真一覧を返す", async () => {
    const paged: PaginatedPhotos = { items: [], total: 0, page: 1, limit: 20 };
    const speciesRepo = {
      findById: vi.fn().mockResolvedValue(makeSpecies()),
    } as unknown as ISpeciesRepository;
    const photoRepo = {
      findBySpeciesId: vi.fn().mockResolvedValue(paged),
    } as unknown as IPhotoRepository;

    const uc = new GetSpeciesGallery(speciesRepo, photoRepo);
    const result = await uc.execute("user-1", "sp-1", 1, 20);

    expect(speciesRepo.findById).toHaveBeenCalledWith("sp-1", "user-1");
    expect(photoRepo.findBySpeciesId).toHaveBeenCalledWith("sp-1", "user-1", 1, 20);
    expect(result).toBe(paged);
  });

  it("種が存在しない場合は SpeciesNotFoundError を投げる", async () => {
    const speciesRepo = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as ISpeciesRepository;
    const photoRepo = {
      findBySpeciesId: vi.fn(),
    } as unknown as IPhotoRepository;

    const uc = new GetSpeciesGallery(speciesRepo, photoRepo);
    await expect(uc.execute("user-1", "sp-x", 1, 20)).rejects.toThrow(SpeciesNotFoundError);
    expect(photoRepo.findBySpeciesId).not.toHaveBeenCalled();
  });
});
