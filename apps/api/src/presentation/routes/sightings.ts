import { Hono } from 'hono';
import type { RegisterSighting } from '../../application/use-cases/register-sighting.js';
import { SightingNotFoundError } from '../../application/use-cases/register-sighting.js';
import type { GetHeatmapData } from '../../application/use-cases/get-heatmap-data.js';
import { CreateSightingSchema, UpdateSightingSchema, SightingQuerySchema } from '../dto/sighting.js';
import type { HonoEnv } from '../middleware/auth.js';

export function createSightingsRoutes({
  registerSighting,
  getHeatmapData,
  authMiddleware,
}: {
  registerSighting: RegisterSighting;
  getHeatmapData: GetHeatmapData;
  authMiddleware: ReturnType<typeof import('../middleware/auth.js').createAuthMiddleware>;
}) {
  const router = new Hono<HonoEnv>();

  router.use('*', authMiddleware);

  // GET /
  router.get('/', async (c) => {
    const user = c.get('user');
    const parsed = SightingQuerySchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

    const { page, limit, species_id, from, to, sort } = parsed.data;
    const result = await registerSighting.getAll(user.id, {
      page,
      limit,
      speciesId: species_id,
      from,
      to,
      sort,
    });
    return c.json(result);
  });

  // GET /heatmap — must be before /:id
  router.get('/heatmap', async (c) => {
    const user = c.get('user');
    const speciesId = c.req.query('species_id');
    const points = await getHeatmapData.execute(user.id, speciesId);
    return c.json(points);
  });

  // GET /:id
  router.get('/:id', async (c) => {
    const user = c.get('user');
    try {
      const s = await registerSighting.getById(c.req.param('id'), user.id);
      return c.json(s);
    } catch (err) {
      if (err instanceof SightingNotFoundError) return c.json({ error: err.message }, 404);
      throw err;
    }
  });

  // POST /
  router.post('/', async (c) => {
    const user = c.get('user');
    const parsed = CreateSightingSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);
    try {
      const s = await registerSighting.create(user.id, parsed.data);
      return c.json(s, 201);
    } catch (err) {
      if (err instanceof Error) return c.json({ error: err.message }, 400);
      throw err;
    }
  });

  // PUT /:id
  router.put('/:id', async (c) => {
    const user = c.get('user');
    const parsed = UpdateSightingSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);
    try {
      const s = await registerSighting.update(c.req.param('id'), user.id, parsed.data);
      return c.json(s);
    } catch (err) {
      if (err instanceof SightingNotFoundError) return c.json({ error: err.message }, 404);
      if (err instanceof Error) return c.json({ error: err.message }, 400);
      throw err;
    }
  });

  // DELETE /:id
  router.delete('/:id', async (c) => {
    const user = c.get('user');
    try {
      await registerSighting.delete(c.req.param('id'), user.id);
      return c.body(null, 204);
    } catch (err) {
      if (err instanceof SightingNotFoundError) return c.json({ error: err.message }, 404);
      throw err;
    }
  });

  return router;
}
