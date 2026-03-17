import type { User } from '../entities/user.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByGithubId(githubId: string): Promise<User | null>;
  upsert(data: { githubId: string; username: string; avatarUrl?: string | null }): Promise<User>;
}
