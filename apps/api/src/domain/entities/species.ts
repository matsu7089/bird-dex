export interface Species {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpeciesWithCount extends Species {
  photoCount: number;
}
