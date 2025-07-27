import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { deleteBook, saveUserPreferences, UserPreferences } from '@/db';
import { Link } from '@tanstack/react-router';
import {
  LayoutGridIcon,
  ListIcon,
  Settings2Icon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function Library({
  books,
  coverUrls,
  userPreferences,
}: {
  books: { id: string; name: string }[];
  coverUrls: Record<string, string>;
  userPreferences: UserPreferences;
}) {
  const [bookList, setBookList] = useState(books);
  const [isEditing, setIsEditing] = useState(false);
  // Reader preferences
  const [layout, setLayout] = useState<'grid' | 'list'>(
    (userPreferences.layout as 'grid' | 'list') || 'grid'
  );
  const [showBookCover, setShowBookCover] = useState(
    userPreferences.showBookCover as boolean
  );
  const [showBookProgress, setShowBookProgress] = useState(
    userPreferences.showBookProgress as boolean
  );

  async function handleDelete(bookId: string) {
    try {
      await deleteBook(bookId);
      setBookList((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('The book was deleted successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to delete the book');
    }
  }

  useEffect(() => {
    saveUserPreferences({ showBookCover, showBookProgress, layout });
  }, [showBookCover, showBookProgress, layout]);

  useEffect(() => {
    setBookList(books);
  }, [books]);

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-xl font-bold">My library</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Settings2Icon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showBookCover}
              onCheckedChange={setShowBookCover}
            >
              Book cover
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showBookProgress}
              onCheckedChange={setShowBookProgress}
              disabled
            >
              Book progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-between group"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Delete'}
              <Trash2Icon className="w-4 h-4 text-red-500 group-hover:text-gray-50 transition-all" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          defaultValue="grid"
          value={layout}
          onValueChange={(value) => {
            if (value) setLayout(value as 'grid' | 'list');
          }}
          className="gap-0"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Toggle grid view"
            className="rounded-r-none border-r-0"
          >
            <LayoutGridIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="Toggle list view"
            className="rounded-s-none"
            disabled
          >
            <ListIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {bookList.map((b) => (
          <Link to={`/books/${b.id}`} key={b.id}>
            <div
              className={
                'flex flex-col justify-between bg-card rounded-lg shadow-sm hover:shadow-lg transition-all p-3'
              }
            >
              {showBookCover &&
                (coverUrls[b.id] ? (
                  <img
                    src={coverUrls[b.id] || ''}
                    alt={`${b.name} book cover`}
                    className="rounded-lg w-full h-72 object-cover mb-2"
                  />
                ) : (
                  <Skeleton className="h-72 w-full mb-2" />
                ))}
              <h1 className="truncate font-medium text-center">{b.name}</h1>
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(b.id);
                  }}
                >
                  <Trash2Icon />
                  Delete
                </Button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
