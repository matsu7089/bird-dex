import { and, asc, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { sightings, photos, species } from "../db/schema.js";
import type {
  ISightingRepository,
  SightingFilters,
} from "../../domain/repositories/sighting-repository.js";
import type {
  Sighting,
  SightingWithPhotos,
  PaginatedResult,
  HeatmapPoint,
} from "../../domain/entities/sighting.js";

export class DrizzleSightingRepository implements ISightingRepository {
  constructor(private readonly db: Db) {}

  async findAllByUserId(
    userId: string,
    filters: SightingFilters,
  ): Promise<PaginatedResult<SightingWithPhotos>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(sightings.userId, userId)];

    if (filters.from) conditions.push(gte(sightings.sightedAt, filters.from));
    if (filters.to) conditions.push(lte(sightings.sightedAt, filters.to));
    if (filters.speciesId) {
      const subq = this.db
        .selectDistinct({ sightingId: photos.sightingId })
        .from(photos)
        .where(eq(photos.speciesId, filters.speciesId));
      conditions.push(inArray(sightings.id, subq));
    }

    const where = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count(sightings.id) })
      .from(sightings)
      .where(where);

    const orderBy =
      filters.sort === "date_asc" ? asc(sightings.sightedAt) : desc(sightings.sightedAt);

    const rows = await this.db
      .select()
      .from(sightings)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const sightingIds = rows.map((r) => r.id);

    const photoRows =
      sightingIds.length > 0
        ? await this.db
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
              createdAt: photos.createdAt,
            })
            .from(photos)
            .innerJoin(species, eq(photos.speciesId, species.id))
            .innerJoin(sightings, eq(photos.sightingId, sightings.id))
            .where(inArray(photos.sightingId, sightingIds))
            .orderBy(photos.sortOrder)
        : [];

    const photosBySightingId = new Map<string, typeof photoRows>();
    for (const p of photoRows) {
      const arr = photosBySightingId.get(p.sightingId) ?? [];
      arr.push(p);
      photosBySightingId.set(p.sightingId, arr);
    }

    const items: SightingWithPhotos[] = rows.map((r) => ({
      ...r,
      photos: photosBySightingId.get(r.id) ?? [],
    }));

    return { items, total: Number(total), page, limit };
  }

  async findById(id: string, userId: string): Promise<SightingWithPhotos | null> {
    const rows = await this.db
      .select()
      .from(sightings)
      .where(and(eq(sightings.id, id), eq(sightings.userId, userId)))
      .limit(1);

    if (!rows[0]) return null;

    const photoRows = await this.db
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
        createdAt: photos.createdAt,
      })
      .from(photos)
      .innerJoin(species, eq(photos.speciesId, species.id))
      .innerJoin(sightings, eq(photos.sightingId, sightings.id))
      .where(eq(photos.sightingId, id))
      .orderBy(photos.sortOrder);

    return { ...rows[0], photos: photoRows };
  }

  async create(data: {
    userId: string;
    memo?: string | null;
    sightedAt: string;
    latitude: number;
    longitude: number;
    locationName?: string | null;
  }): Promise<Sighting> {
    const rows = await this.db
      .insert(sightings)
      .values({
        userId: data.userId,
        memo: data.memo ?? null,
        sightedAt: data.sightedAt,
        latitude: String(data.latitude),
        longitude: String(data.longitude),
        locationName: data.locationName ?? null,
      })
      .returning();
    return rows[0]!;
  }

  async update(
    id: string,
    userId: string,
    data: {
      memo?: string | null;
      sightedAt?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string | null;
    },
  ): Promise<Sighting> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.memo !== undefined) updateData.memo = data.memo;
    if (data.sightedAt !== undefined) updateData.sightedAt = data.sightedAt;
    if (data.latitude !== undefined) updateData.latitude = String(data.latitude);
    if (data.longitude !== undefined) updateData.longitude = String(data.longitude);
    if (data.locationName !== undefined) updateData.locationName = data.locationName;

    const rows = await this.db
      .update(sightings)
      .set(updateData)
      .where(and(eq(sightings.id, id), eq(sightings.userId, userId)))
      .returning();
    return rows[0]!;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db.delete(sightings).where(and(eq(sightings.id, id), eq(sightings.userId, userId)));
  }

  async getHeatmapData(userId: string, speciesId?: string): Promise<HeatmapPoint[]> {
    if (!speciesId) {
      const rows = await this.db
        .select({
          latitude: sightings.latitude,
          longitude: sightings.longitude,
        })
        .from(sightings)
        .where(eq(sightings.userId, userId));

      return rows.map((r) => ({
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        weight: 1,
      }));
    }

    const rows = await this.db
      .selectDistinct({
        id: sightings.id,
        latitude: sightings.latitude,
        longitude: sightings.longitude,
      })
      .from(sightings)
      .innerJoin(photos, eq(photos.sightingId, sightings.id))
      .where(and(eq(sightings.userId, userId), eq(photos.speciesId, speciesId)));

    return rows.map((r) => ({
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      weight: 1,
    }));
  }
}
