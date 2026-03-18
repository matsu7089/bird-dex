import { createMiddleware } from "hono/factory";
import { getSignedCookie } from "hono/cookie";
import type { User } from "../../domain/entities/user.js";
import type { IUserRepository } from "../../domain/repositories/user-repository.js";

export type HonoEnv = { Variables: { user: User } };

export function createAuthMiddleware(userRepo: IUserRepository) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      return c.json({ error: "Server misconfiguration" }, 500);
    }
    const userId = await getSignedCookie(c, sessionSecret, "session");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const user = await userRepo.findById(userId);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("user", user);
    await next();
  });
}
