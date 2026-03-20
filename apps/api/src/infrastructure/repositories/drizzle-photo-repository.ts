import { and, count, desc, eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { photos, sightings, species } from "../db/schema.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { Photo, PhotoWithSpecies, PaginatedPhotos } from "../../domain/entities/photo.js";

export class DrizzlePhotoRepository implements IPhotoRepository {
  constructor(private readonly db: Db) {}

  async findBySightingId(sightingId: string): Promise<PhotoWithSpecies[]> {
    const rows = await this.db
      .select({
        id: photos.id,
        sightingId: photos.sightingId,
        speciesId: photos.speciesId,
        speciesName: species.name,
        sightedAt: sightings.sightedAt,
        blobUrl: photos.blobUrl,
        thumbnailUrl: photos.thumbnailUrl,
        originalFilename: photos.originalFilename,
        sortOrder: photos.sortOrder,
        cameraMake: photos.cameraMake,
        cameraModel: photos.cameraModel,
        fNumber: photos.fNumber,
        shutterSpeed: photos.shutterSpeed,
        focalLength: photos.focalLength,
        iso: photos.iso,
        createdAt: photos.createdAt,
      })
      .from(photos)
      .innerJoin(species, eq(photos.speciesId, species.id))
      .innerJoin(sightings, eq(photos.sightingId, sightings.id))
      .where(eq(photos.sightingId, sightingId))
      .orderBy(photos.sortOrder);

    return rows;
  }

  async findBySpeciesId(
    speciesId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedPhotos> {
    const offset = (page - 1) * limit;

    const where = and(eq(photos.speciesId, speciesId), eq(sightings.userId, userId));

    const [{ total }] = await this.db
      .select({ total: count(photos.id) })
      .from(photos)
      .innerJoin(sightings, eq(photos.sightingId, sightings.id))
      .where(where);

    const rows = await this.db
      .select({
        id: photos.id,
        sightingId: photos.sightingId,
        speciesId: photos.speciesId,
        speciesName: species.name,
        sightedAt: sightings.sightedAt,
        blobUrl: photos.blobUrl,
        thumbnailUrl: photos.thumbnailUrl,
        originalFilename: photos.originalFilename,
        sortOrder: photos.sortOrder,
        cameraMake: photos.cameraMake,
        cameraModel: photos.cameraModel,
        fNumber: photos.fNumber,
        shutterSpeed: photos.shutterSpeed,
        focalLength: photos.focalLength,
        iso: photos.iso,
        createdAt: photos.createdAt,
      })
      .from(photos)
      .innerJoin(sightings, eq(photos.sightingId, sightings.id))
      .innerJoin(species, eq(photos.speciesId, species.id))
      .where(where)
      .orderBy(desc(photos.createdAt))
      .limit(limit)
      .offset(offset);

    return { items: rows, total: Number(total), page, limit };
  }

  async create(data: {
    sightingId: string;
    speciesId: string;
    blobUrl: string;
    thumbnailUrl?: string | null;
    originalFilename: string;
    sortOrder?: number;
    cameraMake?: string | null;
    cameraModel?: string | null;
    fNumber?: number | null;
    shutterSpeed?: number | null;
    focalLength?: number | null;
    iso?: number | null;
  }): Promise<Photo> {
    const rows = await this.db
      .insert(photos)
      .values({
        sightingId: data.sightingId,
        speciesId: data.speciesId,
        blobUrl: data.blobUrl,
        thumbnailUrl: data.thumbnailUrl ?? null,
        originalFilename: data.originalFilename,
        sortOrder: data.sortOrder ?? 0,
        cameraMake: data.cameraMake ?? null,
        cameraModel: data.cameraModel ?? null,
        fNumber: data.fNumber ?? null,
        shutterSpeed: data.shutterSpeed ?? null,
        focalLength: data.focalLength ?? null,
        iso: data.iso ?? null,
      })
      .returning();
    return rows[0]!;
  }

  async findById(id: string): Promise<Photo | null> {
    const rows = await this.db.select().from(photos).where(eq(photos.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async update(id: string, data: { speciesId?: string }): Promise<Photo> {
    const updateData: Record<string, unknown> = {};
    if (data.speciesId !== undefined) updateData.speciesId = data.speciesId;

    const rows = await this.db.update(photos).set(updateData).where(eq(photos.id, id)).returning();
    return rows[0]!;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(photos).where(eq(photos.id, id));
  }
}
