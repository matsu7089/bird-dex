import type { IUserRepository } from '../../domain/repositories/user-repository.js';
import type { User } from '../../domain/entities/user.js';
import type { GitHubOAuthClient } from '../../infrastructure/auth/github-oauth.js';

export class AuthenticateWithGithub {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly oauthClient: GitHubOAuthClient,
  ) {}

  async execute(code: string): Promise<User> {
    const { githubUser } = await this.oauthClient.validateCallback(code);
    return this.userRepo.upsert({
      githubId: String(githubUser.id),
      username: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    });
  }
}
