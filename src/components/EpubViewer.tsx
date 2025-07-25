import { useEffect, useState, useRef } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { StoredBook } from '../db';
import { ReaderControls, ReaderSettings } from './ReaderControls';
import { Button } from '@/components/ui/button';
import { MoveLeftIcon, MoveRightIcon } from 'lucide-react';

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.5,
  fontFamily: 'Georgia, serif',
};

export function EpubViewer({ book }: { book: StoredBook }) {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const leftBtnRef = useRef<HTMLButtonElement | null>(null);
  const rightBtnRef = useRef<HTMLButtonElement | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [epubBook, setEpubBook] = useState<Book | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);

  // Navegação por teclado + animação nos botões
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!rendition) return;
      if (e.key === 'ArrowLeft') {
        rendition.prev();
        if (leftBtnRef.current) {
          leftBtnRef.current.classList.add('scale-90');
          setTimeout(
            () =>
              leftBtnRef.current &&
              leftBtnRef.current.classList.remove('scale-90'),
            150
          );
        }
      } else if (e.key === 'ArrowRight') {
        rendition.next();
        if (rightBtnRef.current) {
          rightBtnRef.current.classList.add('scale-90');
          setTimeout(
            () =>
              rightBtnRef.current &&
              rightBtnRef.current.classList.remove('scale-90'),
            150
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rendition]);

  // Lê o arquivo do StoredBook como ArrayBuffer
  useEffect(() => {
    if (!book) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setArrayBuffer(e.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(book.file);
  }, [book]);

  // 2) Instancia o epub.js e renderiza o livro
  useEffect(() => {
    if (!arrayBuffer || !viewerRef.current) return;
    const book = ePub(arrayBuffer);
    // setEpubBook(book);
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
    });
    setRendition(rendition);
    rendition.display();
    return () => {
      rendition.destroy();
      book.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayBuffer]);

  // 2.1) Aplica estilos do ReaderControls ao epub.js
  useEffect(() => {
    if (!rendition) return;
    // Tema
    let bg = '#fff',
      color = '#000';
    if (settings.theme === 'dark') {
      bg = '#000';
      color = '#fff';
    }
    rendition.themes.default({
      body: {
        'background-color': bg,
        color: color,
        margin: 0,
        padding: 0,
      },
      p: {
        'font-family': settings.fontFamily,
        'font-size': `${settings.fontSize}px`,
        'line-height': settings.lineHeight,
        margin: 0,
        padding: 0,
      },
    });
    rendition.themes.select('custom');
  }, [rendition, settings]);

  // 3) Quando o rendition ficar pronto, hook de relocated
  useEffect(() => {
    if (!rendition) return;
    rendition.on('relocated', (loc) => {
      setLocation(loc.start.cfi);
    });
    return () => {
      rendition.off('relocated', () => {});
    };
  }, [rendition]);

  if (!arrayBuffer) {
    return <div className="p-4">Carregando leitor…</div>;
  }

  return (
    <div className="relative h-screen flex flex-col">
      <ReaderControls settings={settings} onChange={setSettings} />
      {/* Navegação */}
      <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: 16,
          left: 0,
          right: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Button
          ref={leftBtnRef}
          variant="secondary"
          size="icon"
          onClick={() => rendition && rendition.prev()}
          disabled={!rendition}
          aria-label="Página anterior"
          className="transition-transform duration-150"
        >
          <MoveLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          ref={rightBtnRef}
          variant="secondary"
          size="icon"
          onClick={() => rendition && rendition.next()}
          disabled={!rendition}
          aria-label="Próxima página"
          className="transition-transform duration-150"
        >
          <MoveRightIcon className="w-4 h-4" />
        </Button>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
