import { Hono } from "hono";
import type { AddPhotoToSighting } from "../../application/use-cases/add-photo-to-sighting.js";
import {
  InvalidPhotoError,
  FileTooLargeError,
  SightingNotFoundError,
  SpeciesNotFoundError,
} from "../../application/use-cases/add-photo-to-sighting.js";
import type { IPhotoRepository } from "../../domain/repositories/photo-repository.js";
import type { IBlobStorage } from "../../domain/repositories/blob-storage.js";
import { UpdatePhotoSchema } from "../dto/photo.js";
import type { HonoEnv } from "../middleware/auth.js";

export function createPhotosRoutes(
  addPhotoToSighting: AddPhotoToSighting,
  photoRepository: IPhotoRepository,
  blobStorage: IBlobStorage,
  authMiddleware: ReturnType<typeof import("../middleware/auth.js").createAuthMiddleware>,
) {
  const router = new Hono<HonoEnv>();

  router.use("*", authMiddleware);

  // POST /api/sightings/:sightingId/photos
  router.post("/sightings/:sightingId/photos", async (c) => {
    const user = c.get("user");
    const sightingId = c.req.param("sightingId");

    let formData: FormData;
    try {
      formData = await c.req.formData();
    } catch {
      return c.json({ error: "Invalid multipart form data" }, 400);
    }

    const fileEntry = formData.get("file");
    const speciesId = formData.get("species_id");
    const sortOrderRaw = formData.get("sort_order");

    if (!(fileEntry instanceof File)) {
      return c.json({ error: "Missing file field" }, 400);
    }
    if (typeof speciesId !== "string" || !speciesId) {
      return c.json({ error: "Missing species_id field" }, 400);
    }

    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());
    const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : undefined;

    try {
      const photo = await addPhotoToSighting.execute(user.id, sightingId, {
        file: fileBuffer,
        filename: fileEntry.name,
        contentType: fileEntry.type,
        speciesId,
        sortOrder,
      });
      return c.json(photo, 201);
    } catch (err) {
      if (err instanceof InvalidPhotoError) return c.json({ error: err.message }, 400);
      if (err instanceof FileTooLargeError) return c.json({ error: err.message }, 400);
      if (err instanceof SightingNotFoundError) return c.json({ error: err.message }, 404);
      if (err instanceof SpeciesNotFoundError) return c.json({ error: err.message }, 422);
      throw err;
    }
  });

  // PUT /api/photos/:id
  router.put("/photos/:id", async (c) => {
    const parsed = UpdatePhotoSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

    const photo = await photoRepository.findById(c.req.param("id"));
    if (!photo) return c.json({ error: "Photo not found" }, 404);

    const updated = await photoRepository.update(photo.id, { speciesId: parsed.data.speciesId });
    return c.json(updated);
  });

  // DELETE /api/photos/:id
  router.delete("/photos/:id", async (c) => {
    const photo = await photoRepository.findById(c.req.param("id"));
    if (!photo) return c.json({ error: "Photo not found" }, 404);

    // Derive keys from blobUrl: strip endpoint+bucket prefix
    // blobUrl format: ${endpoint}/${bucket}/${key}
    const blobKey = photo.blobUrl.split("/").slice(4).join("/");
    await blobStorage.delete(blobKey);

    if (photo.thumbnailUrl) {
      const thumbKey = photo.thumbnailUrl.split("/").slice(4).join("/");
      await blobStorage.delete(thumbKey);
    }

    await photoRepository.delete(photo.id);
    return c.body(null, 204);
  });

  return router;
}
