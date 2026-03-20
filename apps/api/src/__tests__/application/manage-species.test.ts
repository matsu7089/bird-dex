import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ManageSpecies,
  DuplicateSpeciesNameError,
  SpeciesNotFoundError,
} from "../../application/use-cases/manage-species.js";
import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { Species, SpeciesWithCount } from "../../domain/entities/species.js";

function makeSpecies(overrides: Partial<Species> = {}): Species {
  return {
    id: "sp-1",
    userId: "user-1",
    name: "スズメ",
    description: null,
    sortOrder: 0,
    bestPhotoId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<ISpeciesRepository> = {}): ISpeciesRepository {
  return {
    findAllByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setBestPhoto: vi.fn(),
    delete: vi.fn(),
    existsByName: vi.fn(),
    ...overrides,
  };
}

describe("ManageSpecies", () => {
  describe("getAll", () => {
    it("リポジトリの findAllByUserId を呼ぶ", async () => {
      const items: SpeciesWithCount[] = [];
      const repo = makeRepo({ findAllByUserId: vi.fn().mockResolvedValue(items) });
      const uc = new ManageSpecies(repo);
      const result = await uc.getAll("user-1");
      expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1");
      expect(result).toBe(items);
    });
  });

  describe("getById", () => {
    it("存在する Species を返す", async () => {
      const sp = makeSpecies();
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(sp) });
      const uc = new ManageSpecies(repo);
      await expect(uc.getById("sp-1", "user-1")).resolves.toBe(sp);
    });

    it("存在しない場合は SpeciesNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new ManageSpecies(repo);
      await expect(uc.getById("sp-x", "user-1")).rejects.toThrow(SpeciesNotFoundError);
    });
  });

  describe("create", () => {
    it("正常に Species を作成する", async () => {
      const sp = makeSpecies();
      const repo = makeRepo({
        existsByName: vi.fn().mockResolvedValue(false),
        create: vi.fn().mockResolvedValue(sp),
      });
      const uc = new ManageSpecies(repo);
      const result = await uc.create("user-1", { name: "スズメ" });
      expect(repo.existsByName).toHaveBeenCalledWith("user-1", "スズメ");
      expect(repo.create).toHaveBeenCalledWith({
        userId: "user-1",
        name: "スズメ",
        description: undefined,
        sortOrder: undefined,
      });
      expect(result).toBe(sp);
    });

    it("前後の空白をトリムした名前で existsByName を呼ぶ", async () => {
      const repo = makeRepo({
        existsByName: vi.fn().mockResolvedValue(false),
        create: vi.fn().mockResolvedValue(makeSpecies()),
      });
      const uc = new ManageSpecies(repo);
      await uc.create("user-1", { name: "  スズメ  " });
      expect(repo.existsByName).toHaveBeenCalledWith("user-1", "スズメ");
    });

    it("空の名前で SpeciesName バリデーションエラーを投げる", async () => {
      const repo = makeRepo();
      const uc = new ManageSpecies(repo);
      await expect(uc.create("user-1", { name: "" })).rejects.toThrow(
        "Species name cannot be empty",
      );
    });

    it("重複する名前で DuplicateSpeciesNameError を投げる", async () => {
      const repo = makeRepo({ existsByName: vi.fn().mockResolvedValue(true) });
      const uc = new ManageSpecies(repo);
      await expect(uc.create("user-1", { name: "スズメ" })).rejects.toThrow(
        DuplicateSpeciesNameError,
      );
    });
  });

  describe("update", () => {
    it("正常に Species を更新する", async () => {
      const sp = makeSpecies();
      const updated = makeSpecies({ name: "カラス" });
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(sp),
        existsByName: vi.fn().mockResolvedValue(false),
        update: vi.fn().mockResolvedValue(updated),
      });
      const uc = new ManageSpecies(repo);
      const result = await uc.update("sp-1", "user-1", { name: "カラス" });
      expect(repo.existsByName).toHaveBeenCalledWith("user-1", "カラス", "sp-1");
      expect(result).toBe(updated);
    });

    it("存在しない Species は SpeciesNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new ManageSpecies(repo);
      await expect(uc.update("sp-x", "user-1", { name: "カラス" })).rejects.toThrow(
        SpeciesNotFoundError,
      );
    });

    it("更新先の名前が重複する場合 DuplicateSpeciesNameError を投げる", async () => {
      const sp = makeSpecies();
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(sp),
        existsByName: vi.fn().mockResolvedValue(true),
      });
      const uc = new ManageSpecies(repo);
      await expect(uc.update("sp-1", "user-1", { name: "カラス" })).rejects.toThrow(
        DuplicateSpeciesNameError,
      );
    });
  });

  describe("delete", () => {
    it("正常に Species を削除する", async () => {
      const sp = makeSpecies();
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(sp),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      const uc = new ManageSpecies(repo);
      await uc.delete("sp-1", "user-1");
      expect(repo.delete).toHaveBeenCalledWith("sp-1", "user-1");
    });

    it("存在しない Species は SpeciesNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new ManageSpecies(repo);
      await expect(uc.delete("sp-x", "user-1")).rejects.toThrow(SpeciesNotFoundError);
    });
  });

  describe("setBestPhoto", () => {
    it("存在しない Species は SpeciesNotFoundError を投げる", async () => {
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const uc = new ManageSpecies(repo);
      await expect(uc.setBestPhoto("sp-x", "user-1", "photo-1")).rejects.toThrow(
        SpeciesNotFoundError,
      );
    });

    it("正常にベストフォトを設定する", async () => {
      const sp = makeSpecies();
      const updated = makeSpecies({ bestPhotoId: "photo-1" });
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(sp),
        setBestPhoto: vi.fn().mockResolvedValue(updated),
      });
      const uc = new ManageSpecies(repo);
      const result = await uc.setBestPhoto("sp-1", "user-1", "photo-1");
      expect(repo.setBestPhoto).toHaveBeenCalledWith("sp-1", "user-1", "photo-1");
      expect(result).toBe(updated);
    });
  });
});
