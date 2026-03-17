import { Hono } from 'hono';
import { getSignedCookie, setSignedCookie, deleteCookie } from 'hono/cookie';
import type { IUserRepository } from '../../domain/repositories/user-repository.js';
import type { AuthenticateWithGithub } from '../../application/use-cases/authenticate-with-github.js';
import type { GitHubOAuthClient } from '../../infrastructure/auth/github-oauth.js';
import { createAuthMiddleware, type HonoEnv } from '../middleware/auth.js';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const STATE_MAX_AGE = 600; // 10 minutes

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

export function createAuthRoutes(
  userRepo: IUserRepository,
  githubOAuthClient: GitHubOAuthClient,
  authenticateWithGithub: AuthenticateWithGithub,
) {
  const router = new Hono<HonoEnv>();
  const authMiddleware = createAuthMiddleware(userRepo);

  // GET /auth/github — initiate OAuth flow
  router.get('/github', async (c) => {
    const { url, state } = githubOAuthClient.createAuthorizationURL();
    const secret = getSessionSecret();
    await setSignedCookie(c, 'oauth_state', state, secret, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: STATE_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    });
    return c.redirect(url.toString());
  });

  // GET /auth/github/callback — handle OAuth callback
  router.get('/github/callback', async (c) => {
    const secret = getSessionSecret();
    const storedState = await getSignedCookie(c, secret, 'oauth_state');
    const { code, state } = c.req.query();

    if (!storedState || !state || storedState !== state) {
      return c.json({ error: 'Invalid state' }, 400);
    }
    if (!code) {
      return c.json({ error: 'Missing code' }, 400);
    }

    deleteCookie(c, 'oauth_state', { path: '/' });

    const user = await authenticateWithGithub.execute(code);

    await setSignedCookie(c, 'session', user.id, secret, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return c.redirect(frontendUrl);
  });

  // POST /auth/logout
  router.post('/logout', (c) => {
    deleteCookie(c, 'session', { path: '/' });
    return c.json({ ok: true });
  });

  // GET /auth/me
  router.get('/me', authMiddleware, (c) => {
    const user = c.get('user');
    return c.json({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  });

  return router;
}
