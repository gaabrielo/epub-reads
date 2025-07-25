import { createFileRoute } from '@tanstack/react-router';
import { getBook, StoredBook } from '../db';
import { EpubViewer } from '@/components/EpubViewer';

export const Route = createFileRoute('/books/$bookId')({
  loader: async ({ params }) => {
    const book = await getBook(params.bookId);
    if (!book) throw new Error('Livro não encontrado');
    return book;
  },
  component: BookComponent,
});

function BookComponent() {
  const book = Route.useLoaderData() as StoredBook;
  return <EpubViewer book={book} />;
}
