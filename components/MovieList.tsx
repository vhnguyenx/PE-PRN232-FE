'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { movieApi } from '@/lib/api';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Search, Plus, Trash2, Edit, Film, Star } from 'lucide-react';
import Image from 'next/image';

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [movies, searchTerm, selectedGenre, sortBy, sortOrder]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieApi.getMovies();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      alert('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await movieApi.getGenres();
      setGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...movies];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else if (sortBy === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      }
      return 0;
    });

    setFilteredMovies(filtered);
  };

  const handleDelete = async () => {
    if (!movieToDelete) return;

    try {
      await movieApi.deleteMovie(movieToDelete.id);
      setMovies(movies.filter(m => m.id !== movieToDelete.id));
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const openDeleteDialog = (movie: Movie) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-gray-400 text-sm">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600 text-xl font-semibold">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-blue-900">Movie Watchlist</h1>
        </div>
        <Button onClick={() => router.push('/movies/add')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Movie
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search movies by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1"
              >
                <option value="title">Sort by Title</option>
                <option value="rating">Sort by Rating</option>
              </Select>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-24"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Film className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedGenre
                ? 'No movies found matching your filters'
                : 'No movies in your watchlist yet. Add your first movie!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card
              key={movie.id}
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            >
              <CardHeader className="p-0">
                <div className="relative h-64 w-full bg-gradient-to-br from-blue-100 to-blue-200">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Film className="w-20 h-20 text-blue-300" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 line-clamp-2">{movie.title}</CardTitle>
                <div className="space-y-2">
                  {movie.genre && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Genre:</span> {movie.genre}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Rating:</span>
                    {renderStars(movie.rating)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/movies/${movie.id}/edit`)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(movie)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Movie</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{movieToDelete?.title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
