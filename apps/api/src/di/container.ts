import { db } from '../infrastructure/db/client.js';
import { DrizzleUserRepository } from '../infrastructure/repositories/drizzle-user-repository.js';
import { GitHubOAuthClient } from '../infrastructure/auth/github-oauth.js';
import { AuthenticateWithGithub } from '../application/use-cases/authenticate-with-github.js';
import { DrizzleSpeciesRepository } from '../infrastructure/repositories/drizzle-species-repository.js';
import { ManageSpecies } from '../application/use-cases/manage-species.js';
import { DrizzleSightingRepository } from '../infrastructure/repositories/drizzle-sighting-repository.js';
import { RegisterSighting } from '../application/use-cases/register-sighting.js';
import { GetHeatmapData } from '../application/use-cases/get-heatmap-data.js';

export const userRepository = new DrizzleUserRepository(db);

export const githubOAuthClient = new GitHubOAuthClient(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_REDIRECT_URI ?? 'http://localhost:3000/auth/github/callback',
);

export const authenticateWithGithub = new AuthenticateWithGithub(userRepository, githubOAuthClient);

export const speciesRepository = new DrizzleSpeciesRepository(db);
export const manageSpecies = new ManageSpecies(speciesRepository);

export const sightingRepository = new DrizzleSightingRepository(db);
export const registerSighting = new RegisterSighting(sightingRepository);
export const getHeatmapData = new GetHeatmapData(sightingRepository);
