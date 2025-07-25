import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook, getAllBooks, StoredBook } from '../db';
import { FileUpload } from '@/components/FileUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '/logo.png';
import Epub, { Book } from 'epubjs';

async function getCover(file: File): Promise<string> {
  // 1) lê o arrayBuffer do File
  const buf = await file.arrayBuffer();
  // 2) instancia o epub.js Book
  const book: Book = Epub(buf);
  // 3) espera até ter lido o container/opf
  await book.ready;
  // 4) devolve a URL que aponta para o blob de capa
  const url = await book.coverUrl();
  return url;
}

export default function Index() {
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [coverUrls, setCoverUrls] = useState<{ [id: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadBooks = useCallback(async () => {
    const all = await getAllBooks();
    setBooks(all);
    // Carrega as capas em paralelo
    const covers = await Promise.all(
      all.map(async (b) => {
        try {
          const url = await getCover(b.file);
          return { id: b.id, url };
        } catch {
          return { id: b.id, url: '' };
        }
      })
    );
    const coverMap: { [id: string]: string } = {};
    covers.forEach(({ id, url }) => {
      coverMap[id] = url;
    });
    setCoverUrls(coverMap);
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
      <div className="flex items-center gap-2 mb-6">
        <img src={Logo} alt="" className="w-8 h-8" />
        <h1 className="text-xl font-bold">ePub Reads</h1>
      </div>
      <div className="mb-8">
        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
      </div>

      <h1 className="text-xl font-bold mb-4">Minha biblioteca</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {books.map((b) => {
          return (
            <Card key={b.id} className="p-4 flex flex-col justify-between">
              <img src={coverUrls[b.id] || ''} alt="" />
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
          );
        })}
      </div>
    </div>
  );
}
