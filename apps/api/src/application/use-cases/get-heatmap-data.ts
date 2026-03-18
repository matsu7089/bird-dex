import type { ISightingRepository } from "../../domain/repositories/sighting-repository.js";
import type { HeatmapPoint } from "../../domain/entities/sighting.js";

export class GetHeatmapData {
  constructor(private readonly repo: ISightingRepository) {}

  execute(userId: string, speciesId?: string): Promise<HeatmapPoint[]> {
    return this.repo.getHeatmapData(userId, speciesId);
  }
}
