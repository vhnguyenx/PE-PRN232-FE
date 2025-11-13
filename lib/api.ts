import axios from 'axios';
import { Movie, MovieFormData } from '@/types/movie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pe-prn232-be.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const movieApi = {
  // Get all movies with optional filters
  getMovies: async (params?: {
    search?: string;
    genre?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get<Movie[]>('/movies', { params });
    return response.data;
  },

  // Get movie by ID
  getMovieById: async (id: number) => {
    const response = await api.get<Movie>(`/movies/${id}`);
    return response.data;
  },

  // Get all genres
  getGenres: async () => {
    const response = await api.get<string[]>('/movies/genres');
    return response.data;
  },

  // Create a new movie
  createMovie: async (movie: MovieFormData) => {
    const response = await api.post<Movie>('/movies', movie);
    return response.data;
  },

  // Update a movie
  updateMovie: async (id: number, movie: MovieFormData) => {
    await api.put(`/movies/${id}`, { id, ...movie });
  },

  // Delete a movie
  deleteMovie: async (id: number) => {
    await api.delete(`/movies/${id}`);
  },
};

export default api;
