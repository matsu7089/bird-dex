import { z } from 'zod';

export const CreateSightingSchema = z.object({
  memo: z.string().optional().nullable(),
  sightedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationName: z.string().max(200).optional().nullable(),
});

export const UpdateSightingSchema = CreateSightingSchema.partial();

export const SightingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  species_id: z.string().uuid().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(['date_desc', 'date_asc']).default('date_desc'),
});

export type CreateSightingInput = z.infer<typeof CreateSightingSchema>;
export type UpdateSightingInput = z.infer<typeof UpdateSightingSchema>;
export type SightingQueryInput = z.infer<typeof SightingQuerySchema>;
