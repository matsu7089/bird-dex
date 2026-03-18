import { and, count, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "../db/client.js";
import { species, photos } from "../db/schema.js";
import type { ISpeciesRepository } from "../../domain/repositories/species-repository.js";
import type { Species, SpeciesWithCount } from "../../domain/entities/species.js";
import { SpeciesHasPhotosError } from "../../application/use-cases/manage-species.js";

export class DrizzleSpeciesRepository implements ISpeciesRepository {
  constructor(private readonly db: Db) {}

  async findAllByUserId(userId: string): Promise<SpeciesWithCount[]> {
    const bestPhoto = alias(photos, "best_photo");
    const rows = await this.db
      .select({
        id: species.id,
        userId: species.userId,
        name: species.name,
        description: species.description,
        sortOrder: species.sortOrder,
        bestPhotoId: species.bestPhotoId,
        createdAt: species.createdAt,
        updatedAt: species.updatedAt,
        photoCount: count(photos.id),
        bestPhotoThumbnailUrl: bestPhoto.thumbnailUrl,
        bestPhotoBlobUrl: bestPhoto.blobUrl,
      })
      .from(species)
      .leftJoin(photos, eq(photos.speciesId, species.id))
      .leftJoin(bestPhoto, eq(bestPhoto.id, species.bestPhotoId))
      .where(eq(species.userId, userId))
      .groupBy(species.id, bestPhoto.thumbnailUrl, bestPhoto.blobUrl)
      .orderBy(species.sortOrder, species.createdAt);

    return rows.map((r) => ({ ...r, photoCount: Number(r.photoCount) }));
  }

  async findById(id: string, userId: string): Promise<Species | null> {
    const rows = await this.db
      .select({
        id: species.id,
        userId: species.userId,
        name: species.name,
        description: species.description,
        sortOrder: species.sortOrder,
        bestPhotoId: species.bestPhotoId,
        createdAt: species.createdAt,
        updatedAt: species.updatedAt,
      })
      .from(species)
      .where(and(eq(species.id, id), eq(species.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: {
    userId: string;
    name: string;
    description?: string | null;
    sortOrder?: number;
  }): Promise<Species> {
    const rows = await this.db
      .insert(species)
      .values({
        userId: data.userId,
        name: data.name,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return rows[0]!;
  }

  async setBestPhoto(id: string, userId: string, photoId: string | null): Promise<Species> {
    const rows = await this.db
      .update(species)
      .set({ bestPhotoId: photoId, updatedAt: new Date() })
      .where(and(eq(species.id, id), eq(species.userId, userId)))
      .returning();
    return rows[0]!;
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string | null;
      sortOrder?: number;
      bestPhotoId?: string | null;
    },
  ): Promise<Species> {
    const rows = await this.db
      .update(species)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(species.id, id), eq(species.userId, userId)))
      .returning();
    return rows[0]!;
  }

  async delete(id: string, userId: string): Promise<void> {
    const [{ value }] = await this.db
      .select({ value: count(photos.id) })
      .from(photos)
      .where(eq(photos.speciesId, id));

    if (Number(value) > 0) {
      throw new SpeciesHasPhotosError("Cannot delete species that has photos");
    }

    await this.db.delete(species).where(and(eq(species.id, id), eq(species.userId, userId)));
  }

  async existsByName(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(species.userId, userId), eq(species.name, name)];
    if (excludeId) {
      conditions.push(ne(species.id, excludeId));
    }

    const [{ value }] = await this.db
      .select({ value: count(species.id) })
      .from(species)
      .where(and(...conditions));

    return Number(value) > 0;
  }
}
