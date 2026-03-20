import { db } from "../infrastructure/db/client.js";
import { DrizzleUserRepository } from "../infrastructure/repositories/drizzle-user-repository.js";
import { GitHubOAuthClient } from "../infrastructure/auth/github-oauth.js";
import { AuthenticateWithGithub } from "../application/use-cases/authenticate-with-github.js";
import { DrizzleSpeciesRepository } from "../infrastructure/repositories/drizzle-species-repository.js";
import { ManageSpecies } from "../application/use-cases/manage-species.js";
import { DrizzleSightingRepository } from "../infrastructure/repositories/drizzle-sighting-repository.js";
import { RegisterSighting } from "../application/use-cases/register-sighting.js";
import { GetHeatmapData } from "../application/use-cases/get-heatmap-data.js";
import { AzureBlobStorage } from "../infrastructure/storage/azure-blob-storage.js";
import { DrizzlePhotoRepository } from "../infrastructure/repositories/drizzle-photo-repository.js";
import { AddPhotoToSighting } from "../application/use-cases/add-photo-to-sighting.js";
import { GetSpeciesGallery } from "../application/use-cases/get-species-gallery.js";

export const userRepository = new DrizzleUserRepository(db);

export const githubOAuthClient = new GitHubOAuthClient(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_REDIRECT_URL ?? "http://localhost:3000/auth/github/callback",
);

export const authenticateWithGithub = new AuthenticateWithGithub(userRepository, githubOAuthClient);

export const speciesRepository = new DrizzleSpeciesRepository(db);
export const manageSpecies = new ManageSpecies(speciesRepository);

export const sightingRepository = new DrizzleSightingRepository(db);
export const registerSighting = new RegisterSighting(sightingRepository);
export const getHeatmapData = new GetHeatmapData(sightingRepository);

export const blobStorage = new AzureBlobStorage({
  connectionString: process.env.BLOB_CONNECTION_STRING!,
  container: process.env.BLOB_CONTAINER!,
});

export const photoRepository = new DrizzlePhotoRepository(db);
export const addPhotoToSighting = new AddPhotoToSighting(
  sightingRepository,
  speciesRepository,
  photoRepository,
  blobStorage,
);
export const getSpeciesGallery = new GetSpeciesGallery(speciesRepository, photoRepository);
