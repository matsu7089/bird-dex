import { Hono } from 'hono';
import type { ManageSpecies } from '../../application/use-cases/manage-species.js';
import {
  DuplicateSpeciesNameError,
  SpeciesHasPhotosError,
  SpeciesNotFoundError,
} from '../../application/use-cases/manage-species.js';
import { CreateSpeciesSchema, UpdateSpeciesSchema } from '../dto/species.js';
import type { HonoEnv } from '../middleware/auth.js';

export function createSpeciesRoutes(
  manageSpecies: ManageSpecies,
  authMiddleware: ReturnType<typeof import('../middleware/auth.js').createAuthMiddleware>,
) {
  const router = new Hono<HonoEnv>();

  router.use('*', authMiddleware);

  // GET /
  router.get('/', async (c) => {
    const user = c.get('user');
    const list = await manageSpecies.getAll(user.id);
    return c.json(list);
  });

  // GET /:id
  router.get('/:id', async (c) => {
    const user = c.get('user');
    try {
      const s = await manageSpecies.getById(c.req.param('id'), user.id);
      return c.json(s);
    } catch (err) {
      if (err instanceof SpeciesNotFoundError) return c.json({ error: err.message }, 404);
      throw err;
    }
  });

  // POST /
  router.post('/', async (c) => {
    const user = c.get('user');
    const parsed = CreateSpeciesSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);
    try {
      const s = await manageSpecies.create(user.id, parsed.data);
      return c.json(s, 201);
    } catch (err) {
      if (err instanceof DuplicateSpeciesNameError) return c.json({ error: err.message }, 409);
      if (err instanceof Error) return c.json({ error: err.message }, 400);
      throw err;
    }
  });

  // PUT /:id
  router.put('/:id', async (c) => {
    const user = c.get('user');
    const parsed = UpdateSpeciesSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);
    try {
      const s = await manageSpecies.update(c.req.param('id'), user.id, parsed.data);
      return c.json(s);
    } catch (err) {
      if (err instanceof SpeciesNotFoundError) return c.json({ error: err.message }, 404);
      if (err instanceof DuplicateSpeciesNameError) return c.json({ error: err.message }, 409);
      if (err instanceof Error) return c.json({ error: err.message }, 400);
      throw err;
    }
  });

  // DELETE /:id
  router.delete('/:id', async (c) => {
    const user = c.get('user');
    try {
      await manageSpecies.delete(c.req.param('id'), user.id);
      return c.body(null, 204);
    } catch (err) {
      if (err instanceof SpeciesNotFoundError) return c.json({ error: err.message }, 404);
      if (err instanceof SpeciesHasPhotosError) return c.json({ error: err.message }, 409);
      throw err;
    }
  });

  // GET /:id/photos — stub
  router.get('/:id/photos', async (c) => {
    return c.json({ photos: [] });
  });

  return router;
}
