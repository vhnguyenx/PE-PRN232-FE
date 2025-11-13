export interface Movie {
  id: number;
  title: string;
  genre?: string | null;
  rating?: number | null;
  posterUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface MovieFormData {
  title: string;
  genre?: string;
  rating?: number;
  posterUrl?: string;
}
