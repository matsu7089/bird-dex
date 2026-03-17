import { GitHub, generateState } from 'arctic';

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
}

export class GitHubOAuthClient {
  private github: GitHub;

  constructor(clientId: string, clientSecret: string, redirectURI: string) {
    this.github = new GitHub(clientId, clientSecret, redirectURI);
  }

  createAuthorizationURL(): { url: URL; state: string } {
    const state = generateState();
    const url = this.github.createAuthorizationURL(state, ['read:user']);
    return { url, state };
  }

  async validateCallback(code: string): Promise<{ accessToken: string; githubUser: GitHubUser }> {
    const tokens = await this.github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'bird-dex',
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const githubUser = (await res.json()) as GitHubUser;
    return { accessToken, githubUser };
  }
}
