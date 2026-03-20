import { describe, it, expect, vi } from "vitest";
import { GetHeatmapData } from "../../application/use-cases/get-heatmap-data.js";
import type { ISightingRepository } from "../../domain/repositories/sighting-repository.js";
import type { HeatmapPoint } from "../../domain/entities/sighting.js";

describe("GetHeatmapData", () => {
  it("speciesId なしでヒートマップデータを返す", async () => {
    const points: HeatmapPoint[] = [{ lat: 35.6, lng: 139.7, weight: 3 }];
    const repo = {
      getHeatmapData: vi.fn().mockResolvedValue(points),
    } as unknown as ISightingRepository;

    const uc = new GetHeatmapData(repo);
    const result = await uc.execute("user-1");

    expect(repo.getHeatmapData).toHaveBeenCalledWith("user-1", undefined);
    expect(result).toBe(points);
  });

  it("speciesId ありでリポジトリに渡す", async () => {
    const repo = {
      getHeatmapData: vi.fn().mockResolvedValue([]),
    } as unknown as ISightingRepository;

    const uc = new GetHeatmapData(repo);
    await uc.execute("user-1", "sp-1");

    expect(repo.getHeatmapData).toHaveBeenCalledWith("user-1", "sp-1");
  });
});
