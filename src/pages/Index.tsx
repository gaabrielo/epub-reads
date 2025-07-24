import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook, getAllBooks, StoredBook } from '../db';
import { FileUpload } from '@/components/FileUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadBooks = useCallback(async () => {
    const all = await getAllBooks();
    setBooks(all);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true);
      await addBook(file);
      await loadBooks();
      setIsLoading(false);
    },
    [loadBooks]
  );

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Minha Biblioteca ePub</h1>
      <div className="mb-8">
        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((b) => (
          <Card key={b.id} className="p-4 flex flex-col justify-between">
            <div className="truncate font-medium">{b.name}</div>
            <Button
              className="mt-4"
              onClick={() =>
                window.open(`/reader/${b.id}`, '_blank', 'noopener')
              }
            >
              Ler
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
