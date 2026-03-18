import { Coordinates } from "../../domain/value-objects/coordinates.js";
import type {
  ISightingRepository,
  SightingFilters,
} from "../../domain/repositories/sighting-repository.js";
import type {
  Sighting,
  SightingWithPhotos,
  PaginatedResult,
} from "../../domain/entities/sighting.js";

export class SightingNotFoundError extends Error {}

export class RegisterSighting {
  constructor(private readonly repo: ISightingRepository) {}

  getAll(userId: string, filters: SightingFilters): Promise<PaginatedResult<SightingWithPhotos>> {
    return this.repo.findAllByUserId(userId, filters);
  }

  async getById(id: string, userId: string): Promise<SightingWithPhotos> {
    const s = await this.repo.findById(id, userId);
    if (!s) throw new SightingNotFoundError(`Sighting not found: ${id}`);
    return s;
  }

  async create(
    userId: string,
    input: {
      memo?: string | null;
      sightedAt: string;
      latitude: number;
      longitude: number;
      locationName?: string | null;
    },
  ): Promise<Sighting> {
    new Coordinates(input.latitude, input.longitude);
    return this.repo.create({ userId, ...input });
  }

  async update(
    id: string,
    userId: string,
    input: {
      memo?: string | null;
      sightedAt?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string | null;
    },
  ): Promise<Sighting> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) throw new SightingNotFoundError(`Sighting not found: ${id}`);

    if (input.latitude !== undefined || input.longitude !== undefined) {
      const lat = input.latitude ?? Number(existing.latitude);
      const lng = input.longitude ?? Number(existing.longitude);
      new Coordinates(lat, lng);
    }

    return this.repo.update(id, userId, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) throw new SightingNotFoundError(`Sighting not found: ${id}`);
    await this.repo.delete(id, userId);
  }
}
