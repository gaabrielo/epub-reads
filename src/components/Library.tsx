import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';

export function Library({
  books,
  coverUrls,
}: {
  books: { id: string; name: string }[];
  coverUrls: Record<string, string>;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-xl font-bold">Minha biblioteca</h1>
        <Button variant="outline">Edit</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {books.map((b) => (
          <Link to={`/books/${b.id}`} key={b.id}>
            <div className="flex flex-col justify-between bg-card rounded-lg shadow-sm hover:shadow-lg transition-all p-3">
              {coverUrls[b.id] ? (
                <img
                  src={coverUrls[b.id] || ''}
                  alt={`${b.name} book cover`}
                  className="rounded-lg mb-2 w-full h-72 object-cover"
                />
              ) : (
                <Skeleton className="h-72 w-full" />
              )}
              <h1 className="truncate font-medium text-center mt-auto">
                {b.name}
              </h1>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
