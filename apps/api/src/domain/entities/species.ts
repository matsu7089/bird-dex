export interface Species {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  bestPhotoId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpeciesWithCount extends Species {
  photoCount: number;
  bestPhotoThumbnailUrl: string | null;
  bestPhotoBlobUrl: string | null;
}
