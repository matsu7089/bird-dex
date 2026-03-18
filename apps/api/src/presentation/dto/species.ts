import { z } from 'zod';

export const CreateSpeciesSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const UpdateSpeciesSchema = CreateSpeciesSchema.partial();

export const SetBestPhotoSchema = z.object({
  photoId: z.string().uuid().nullable(),
});

export type CreateSpeciesInput = z.infer<typeof CreateSpeciesSchema>;
export type UpdateSpeciesInput = z.infer<typeof UpdateSpeciesSchema>;

export type SpeciesResponse = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SpeciesWithCountResponse = SpeciesResponse & { photoCount: number };
