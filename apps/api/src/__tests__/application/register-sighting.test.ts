import { describe, it, expect, vi } from "vitest";
import {
  RegisterSighting,
  SightingNotFoundError,
} from "../../application/use-cases/register-sighting.js";
import type { ISightingRepository } from "../../domain/repositories/sighting-repository.js";
import type {
  Sighting,
  SightingWithPhotos,
  PaginatedResult,
} from "../../domain/entities/sighting.js";

function makeSighting(overrides: Partial<Sighting> = {}): Sighting {
  return {
    id: "s-1",
    userId: "user-1",
    memo: null,
    sightedAt: "2024-06-01",
    latitude: "35.6895",
    longitude: "139.6917",
    locationName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeSightingWithPhotos(overrides: Partial<Sighting> = {}): SightingWithPhotos {
  return { ...makeSighting(overrides), photos: [] };
}

function makeRepo(overrides: Partial<ISightingRepository> = {}): ISightingRepository {
  return {
    findAllByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getHeatmapData: vi.fn(),
    ...overrides,
  };
}

describe("RegisterSighting", () => {
  describe("getAll", () => {
    it("リポジトリの findAllByUserId を呼ぶ", async () => {
      const paged: PaginatedResult<SightingWithPhotos> = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      const repo = makeRepo({ findAllByUserId: vi.fn().mockResolvedValue(paged) });
      const uc = new RegisterSighting(repo);
      const result = await uc.getAll("user-1", {});
      expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1", {});
      expect(result).toBe(paged);
    });
  });

  describe("getById", () => {
    it("存在する Sighting を返す", async () => {
      const s = makeSightingWithPhotos();
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(s) });
      const uc = new RegisterSighting(repo);
      await expect(uc.getById("s-1", "user-1")).resolves.toBe(s);
    });

    it("存在しない場合は SightingNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new RegisterSighting(repo);
      await expect(uc.getById("s-x", "user-1")).rejects.toThrow(SightingNotFoundError);
    });
  });

  describe("create", () => {
    it("正常に Sighting を作成する", async () => {
      const s = makeSighting();
      const repo = makeRepo({ create: vi.fn().mockResolvedValue(s) });
      const uc = new RegisterSighting(repo);
      const result = await uc.create("user-1", {
        sightedAt: "2024-06-01",
        latitude: 35.6895,
        longitude: 139.6917,
      });
      expect(repo.create).toHaveBeenCalledWith({
        userId: "user-1",
        sightedAt: "2024-06-01",
        latitude: 35.6895,
        longitude: 139.6917,
      });
      expect(result).toBe(s);
    });

    it("緯度が無効な値だとエラーを投げる（リポジトリは呼ばれない）", async () => {
      const repo = makeRepo({ create: vi.fn() });
      const uc = new RegisterSighting(repo);
      await expect(
        uc.create("user-1", { sightedAt: "2024-06-01", latitude: 91, longitude: 0 }),
      ).rejects.toThrow("Latitude must be between -90 and 90");
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("経度が無効な値だとエラーを投げる（リポジトリは呼ばれない）", async () => {
      const repo = makeRepo({ create: vi.fn() });
      const uc = new RegisterSighting(repo);
      await expect(
        uc.create("user-1", { sightedAt: "2024-06-01", latitude: 0, longitude: 181 }),
      ).rejects.toThrow("Longitude must be between -180 and 180");
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("正常に Sighting を更新する", async () => {
      const existing = makeSightingWithPhotos();
      const updated = makeSighting({ memo: "更新済み" });
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockResolvedValue(updated),
      });
      const uc = new RegisterSighting(repo);
      const result = await uc.update("s-1", "user-1", { memo: "更新済み" });
      expect(result).toBe(updated);
    });

    it("存在しない Sighting は SightingNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new RegisterSighting(repo);
      await expect(uc.update("s-x", "user-1", {})).rejects.toThrow(SightingNotFoundError);
    });

    it("更新時に無効な緯度を指定するとエラーを投げる", async () => {
      const existing = makeSightingWithPhotos();
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existing),
        update: vi.fn(),
      });
      const uc = new RegisterSighting(repo);
      await expect(uc.update("s-1", "user-1", { latitude: -91 })).rejects.toThrow(
        "Latitude must be between -90 and 90",
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it("latitude のみ更新するとき既存の longitude と組み合わせてバリデーションする", async () => {
      const existing = makeSightingWithPhotos({ longitude: "139.6917" });
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockResolvedValue(makeSighting()),
      });
      const uc = new RegisterSighting(repo);
      await uc.update("s-1", "user-1", { latitude: 35 });
      expect(repo.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("正常に Sighting を削除する", async () => {
      const existing = makeSightingWithPhotos();
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(existing),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      const uc = new RegisterSighting(repo);
      await uc.delete("s-1", "user-1");
      expect(repo.delete).toHaveBeenCalledWith("s-1", "user-1");
    });

    it("存在しない Sighting は SightingNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new RegisterSighting(repo);
      await expect(uc.delete("s-x", "user-1")).rejects.toThrow(SightingNotFoundError);
    });
  });
});
