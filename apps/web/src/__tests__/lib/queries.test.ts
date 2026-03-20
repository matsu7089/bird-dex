import { describe, it, expect } from "vitest";
import { queryKeys } from "../../lib/queries.js";

describe("queryKeys", () => {
  it("authMe は ['auth', 'me'] を返す", () => {
    expect(queryKeys.authMe()).toEqual(["auth", "me"]);
  });

  it("species は ['species'] を返す", () => {
    expect(queryKeys.species()).toEqual(["species"]);
  });

  it("speciesDetail は ['species', id] を返す", () => {
    expect(queryKeys.speciesDetail("sp-1")).toEqual(["species", "sp-1"]);
  });

  it("speciesPhotos は ['species', id, 'photos', page] を返す", () => {
    expect(queryKeys.speciesPhotos("sp-1", 2)).toEqual(["species", "sp-1", "photos", 2]);
  });

  it("sightings は ['sightings', params] を返す", () => {
    const params = { page: 1, limit: 20 };
    expect(queryKeys.sightings(params)).toEqual(["sightings", params]);
  });

  it("sightingDetail は ['sightings', id] を返す", () => {
    expect(queryKeys.sightingDetail("s-1")).toEqual(["sightings", "s-1"]);
  });

  it("heatmap は speciesId なしで ['heatmap', undefined] を返す", () => {
    expect(queryKeys.heatmap()).toEqual(["heatmap", undefined]);
  });

  it("heatmap は speciesId ありで ['heatmap', speciesId] を返す", () => {
    expect(queryKeys.heatmap("sp-1")).toEqual(["heatmap", "sp-1"]);
  });
});
