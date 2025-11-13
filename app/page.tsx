import MovieList from '@/components/MovieList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="container mx-auto px-4 py-8">
        <MovieList />
      </main>
    </div>
  );
}
