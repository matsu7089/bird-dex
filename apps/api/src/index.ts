import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './infrastructure/db/client.js';
import { sql } from 'drizzle-orm';
import { createAuthRoutes } from './presentation/routes/auth.js';
import { createSpeciesRoutes } from './presentation/routes/species.js';
import { userRepository, githubOAuthClient, authenticateWithGithub, manageSpecies } from './di/index.js';
import { createAuthMiddleware } from './presentation/middleware/auth.js';

const app = new Hono();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route('/auth', createAuthRoutes(userRepository, githubOAuthClient, authenticateWithGithub));

const authMiddleware = createAuthMiddleware(userRepository);
app.route('/api/species', createSpeciesRoutes(manageSpecies, authMiddleware));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return c.json(
      {
        status: 'error',
        db: 'disconnected',
        timestamp: new Date().toISOString(),
      },
      503,
    );
  }
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    { error: 'Not Found', message: 'The requested resource does not exist.', statusCode: 404 },
    404,
  );
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error('[unhandled error]', err);
  return c.json(
    { error: 'Internal Server Error', message: 'An unexpected error occurred.', statusCode: 500 },
    500,
  );
});

// ─── Start server ─────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[api] listening on http://localhost:${info.port}`);
});

export default app;
