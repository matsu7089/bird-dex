import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { BlobKey } from "../../domain/value-objects/blob-key.js";
import type { ISightingRepository } from "../../domain/repositories/sighting-repository.js";
import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { IBlobStorage } from "../../domain/repositories/blob-storage.js";
import type { Photo } from "../../domain/entities/photo.js";

export class InvalidPhotoError extends Error {}
export class FileTooLargeError extends Error {}
export class SightingNotFoundError extends Error {}
export class SpeciesNotFoundError extends Error {}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class AddPhotoToSighting {
  constructor(
    private readonly sightingRepository: ISightingRepository,
    private readonly speciesRepository: ISpeciesRepository,
    private readonly photoRepository: IPhotoRepository,
    private readonly blobStorage: IBlobStorage,
  ) {}

  async execute(
    userId: string,
    sightingId: string,
    input: {
      file: Buffer;
      filename: string;
      contentType: string;
      speciesId: string;
      sortOrder?: number;
    },
  ): Promise<Photo> {
    if (!ALLOWED_MIME_TYPES.has(input.contentType)) {
      throw new InvalidPhotoError(`Unsupported file type: ${input.contentType}`);
    }

    if (input.file.length > MAX_FILE_SIZE) {
      throw new FileTooLargeError("File exceeds 10MB limit");
    }

    const sighting = await this.sightingRepository.findById(sightingId, userId);
    if (!sighting) throw new SightingNotFoundError(`Sighting not found: ${sightingId}`);

    const sp = await this.speciesRepository.findById(input.speciesId, userId);
    if (!sp) throw new SpeciesNotFoundError(`Species not found: ${input.speciesId}`);

    const ext = EXT_MAP[input.contentType]!;
    const blobKey = new BlobKey(sightingId, randomUUID(), ext);

    const blobUrl = await this.blobStorage.upload(blobKey.value, input.file, input.contentType);

    const thumbBuffer = await sharp(input.file).resize({ width: 400 }).toBuffer();
    const thumbnailUrl = await this.blobStorage.upload(
      blobKey.thumbnailKey(),
      thumbBuffer,
      input.contentType,
    );

    return this.photoRepository.create({
      sightingId,
      speciesId: input.speciesId,
      blobUrl,
      thumbnailUrl,
      originalFilename: input.filename,
      sortOrder: input.sortOrder,
    });
  }
}
