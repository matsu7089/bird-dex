import { SpeciesName } from '../../domain/value-objects/species-name.js';
import type { ISpeciesRepository } from '../../domain/repositories/species-repository.js';
import type { Species, SpeciesWithCount } from '../../domain/entities/species.js';

export class DuplicateSpeciesNameError extends Error {}
export class SpeciesHasPhotosError extends Error {}
export class SpeciesNotFoundError extends Error {}

export class ManageSpecies {
  constructor(private readonly repo: ISpeciesRepository) {}

  getAll(userId: string): Promise<SpeciesWithCount[]> {
    return this.repo.findAllByUserId(userId);
  }

  async getById(id: string, userId: string): Promise<Species> {
    const s = await this.repo.findById(id, userId);
    if (!s) throw new SpeciesNotFoundError(`Species not found: ${id}`);
    return s;
  }

  async create(
    userId: string,
    input: { name: string; description?: string | null; sortOrder?: number },
  ): Promise<Species> {
    const speciesName = new SpeciesName(input.name);
    const exists = await this.repo.existsByName(userId, speciesName.value);
    if (exists) throw new DuplicateSpeciesNameError(`Species name already exists: ${speciesName.value}`);
    return this.repo.create({
      userId,
      name: speciesName.value,
      description: input.description,
      sortOrder: input.sortOrder,
    });
  }

  async update(
    id: string,
    userId: string,
    input: { name?: string; description?: string | null; sortOrder?: number },
  ): Promise<Species> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) throw new SpeciesNotFoundError(`Species not found: ${id}`);

    const data: { name?: string; description?: string | null; sortOrder?: number } = {};

    if (input.name !== undefined) {
      const speciesName = new SpeciesName(input.name);
      const exists = await this.repo.existsByName(userId, speciesName.value, id);
      if (exists) throw new DuplicateSpeciesNameError(`Species name already exists: ${speciesName.value}`);
      data.name = speciesName.value;
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.repo.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) throw new SpeciesNotFoundError(`Species not found: ${id}`);
    await this.repo.delete(id, userId);
  }
}
