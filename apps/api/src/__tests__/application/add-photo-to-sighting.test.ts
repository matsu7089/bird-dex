import { describe, it, expect, vi } from "vitest";
import {
  AddPhotoToSighting,
  InvalidPhotoError,
  FileTooLargeError,
  SightingNotFoundError,
  SpeciesNotFoundError,
} from "../../application/use-cases/add-photo-to-sighting.js";
import type { ISightingRepository } from "../../domain/repositories/sighting-repository.js";
import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { IBlobStorage } from "../../domain/repositories/blob-storage.js";
import type { Photo } from "../../domain/entities/photo.js";
import type { SightingWithPhotos } from "../../domain/entities/sighting.js";
import type { Species } from "../../domain/entities/species.js";

// sharp をモック（ネイティブモジュールなのでテスト時は使わない）
vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("thumbnail")),
  })),
}));

// exifr をモック
vi.mock("exifr", () => ({
  default: { parse: vi.fn().mockResolvedValue(null) },
}));

function makeSighting(): SightingWithPhotos {
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
    photos: [],
  };
}

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

function makePhoto(): Photo {
  return {
    id: "photo-1",
    sightingId: "s-1",
    speciesId: "sp-1",
    blobUrl: "https://example.com/photo.jpg",
    thumbnailUrl: "https://example.com/photo_thumb.jpg",
    originalFilename: "bird.jpg",
    sortOrder: 0,
    cameraMake: null,
    cameraModel: null,
    fNumber: null,
    shutterSpeed: null,
    focalLength: null,
    iso: null,
    createdAt: new Date(),
  };
}

function makeDeps(
  overrides: {
    sightingRepo?: Partial<ISightingRepository>;
    speciesRepo?: Partial<ISpeciesRepository>;
    photoRepo?: Partial<IPhotoRepository>;
    blobStorage?: Partial<IBlobStorage>;
  } = {},
) {
  const sightingRepo = {
    findById: vi.fn().mockResolvedValue(makeSighting()),
    ...overrides.sightingRepo,
  } as unknown as ISightingRepository;

  const speciesRepo = {
    findById: vi.fn().mockResolvedValue(makeSpecies()),
    ...overrides.speciesRepo,
  } as unknown as ISpeciesRepository;

  const photoRepo = {
    create: vi.fn().mockResolvedValue(makePhoto()),
    ...overrides.photoRepo,
  } as unknown as IPhotoRepository;

  const blobStorage = {
    upload: vi.fn().mockResolvedValue("https://example.com/photo.jpg"),
    ...overrides.blobStorage,
  } as unknown as IBlobStorage;

  return { sightingRepo, speciesRepo, photoRepo, blobStorage };
}

const validInput = {
  file: Buffer.from("fake-image-data"),
  filename: "bird.jpg",
  contentType: "image/jpeg",
  speciesId: "sp-1",
};

describe("AddPhotoToSighting", () => {
  it("正常に Photo を追加する", async () => {
    const photo = makePhoto();
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps({
      photoRepo: { create: vi.fn().mockResolvedValue(photo) },
    });
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    const result = await uc.execute("user-1", "s-1", validInput);

    expect(blobStorage.upload).toHaveBeenCalledTimes(2); // オリジナル + サムネイル
    expect(photoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sightingId: "s-1",
        speciesId: "sp-1",
        originalFilename: "bird.jpg",
      }),
    );
    expect(result).toBe(photo);
  });

  it("サポートされていない MIME タイプは InvalidPhotoError を投げる", async () => {
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps();
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    await expect(
      uc.execute("user-1", "s-1", { ...validInput, contentType: "image/gif" }),
    ).rejects.toThrow(InvalidPhotoError);
    expect(blobStorage.upload).not.toHaveBeenCalled();
  });

  it("ファイルサイズが 20MB を超えると FileTooLargeError を投げる", async () => {
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps();
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    const bigFile = Buffer.alloc(20 * 1024 * 1024 + 1);
    await expect(uc.execute("user-1", "s-1", { ...validInput, file: bigFile })).rejects.toThrow(
      FileTooLargeError,
    );
    expect(blobStorage.upload).not.toHaveBeenCalled();
  });

  it("Sighting が存在しない場合は SightingNotFoundError を投げる", async () => {
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps({
      sightingRepo: { findById: vi.fn().mockResolvedValue(null) },
    });
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    await expect(uc.execute("user-1", "s-x", validInput)).rejects.toThrow(SightingNotFoundError);
    expect(blobStorage.upload).not.toHaveBeenCalled();
  });

  it("Species が存在しない場合は SpeciesNotFoundError を投げる", async () => {
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps({
      speciesRepo: { findById: vi.fn().mockResolvedValue(null) },
    });
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    await expect(uc.execute("user-1", "s-1", validInput)).rejects.toThrow(SpeciesNotFoundError);
    expect(blobStorage.upload).not.toHaveBeenCalled();
  });

  it("png も有効な MIME タイプとして受け付ける", async () => {
    const { sightingRepo, speciesRepo, photoRepo, blobStorage } = makeDeps();
    const uc = new AddPhotoToSighting(sightingRepo, speciesRepo, photoRepo, blobStorage);
    await expect(
      uc.execute("user-1", "s-1", {
        ...validInput,
        contentType: "image/png",
        filename: "bird.png",
      }),
    ).resolves.toBeDefined();
  });
});
