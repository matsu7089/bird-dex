import { eq } from 'drizzle-orm';
import type { Db } from '../db/client.js';
import { users } from '../db/schema.js';
import type { IUserRepository } from '../../domain/repositories/user-repository.js';
import type { User } from '../../domain/entities/user.js';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.githubId, githubId)).limit(1);
    return rows[0] ?? null;
  }

  async upsert(data: { githubId: string; username: string; avatarUrl?: string | null }): Promise<User> {
    const rows = await this.db
      .insert(users)
      .values({
        githubId: data.githubId,
        username: data.username,
        avatarUrl: data.avatarUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          username: data.username,
          avatarUrl: data.avatarUrl ?? null,
        },
      })
      .returning();
    return rows[0]!;
  }
}
