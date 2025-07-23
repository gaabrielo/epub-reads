import { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReaderControls, ReaderSettings, ReaderTheme } from './ReaderControls';
import { cn } from '@/lib/utils';

interface EpubReaderProps {
  file: File;
  onClose: () => void;
}

export const EpubReader = ({ file, onClose }: EpubReaderProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [settings, setSettings] = useState<ReaderSettings>({
    theme: 'sepia',
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
  });

  const applyTheme = (theme: ReaderTheme) => {
    if (!renditionRef.current) return;

    const themes = {
      light: {
        body: {
          'color': 'hsl(var(--reader-light-text))',
          'background': 'hsl(var(--reader-light))',
          'font-family': settings.fontFamily,
          'font-size': `${settings.fontSize}px`,
          'line-height': settings.lineHeight.toString(),
          'padding': '2rem',
          'margin': '0',
        },
      },
      sepia: {
        body: {
          'color': 'hsl(var(--reader-sepia-text))',
          'background': 'hsl(var(--reader-sepia))',
          'font-family': settings.fontFamily,
          'font-size': `${settings.fontSize}px`,
          'line-height': settings.lineHeight.toString(),
          'padding': '2rem',
          'margin': '0',
        },
      },
      dark: {
        body: {
          'color': 'hsl(var(--reader-dark-text))',
          'background': 'hsl(var(--reader-dark))',
          'font-family': settings.fontFamily,
          'font-size': `${settings.fontSize}px`,
          'line-height': settings.lineHeight.toString(),
          'padding': '2rem',
          'margin': '0',
        },
      },
    };

    renditionRef.current.themes.register('current', themes[theme]);
    renditionRef.current.themes.select('current');
  };

  useEffect(() => {
    if (!viewerRef.current || !file) return;

    const initializeBook = async () => {
      try {
        setIsLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // Get book metadata
        await book.ready;
        const metadata = await book.loaded.metadata;
        setBookTitle(metadata.title || file.name);

        // Create rendition
        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          manager: 'default',
        });
        renditionRef.current = rendition;

        // Display the book
        await rendition.display();

        // Apply initial theme
        applyTheme(settings.theme);

        // Setup navigation
        rendition.on('relocated', (location: any) => {
          setCurrentLocation(location.start.cfi);
          const percentage = book.locations.percentageFromCfi(location.start.cfi);
          setProgress(Math.round(percentage * 100));
        });

        // Setup page navigation
        rendition.on('keyup', (event: KeyboardEvent) => {
          if (event.key === 'ArrowLeft') {
            rendition.prev();
          } else if (event.key === 'ArrowRight') {
            rendition.next();
          }
        });

        // Generate locations for progress tracking
        await book.locations.generate(1024);

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading epub:', error);
        setIsLoading(false);
      }
    };

    initializeBook();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [file]);

  useEffect(() => {
    if (renditionRef.current) {
      applyTheme(settings.theme);
    }
  }, [settings]);

  const goToNextPage = () => {
    renditionRef.current?.next();
  };

  const goToPrevPage = () => {
    renditionRef.current?.prev();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 bg-card/95 backdrop-blur-sm shadow-reading">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">Carregando seu livro...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-lg truncate max-w-md">{bookTitle}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {progress}%
          </div>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 relative">
        <div
          ref={viewerRef}
          className={cn(
            "w-full h-full",
            `reader-content theme-${settings.theme}`
          )}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily,
          }}
        />

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-10",
            "bg-card/80 backdrop-blur-sm hover:bg-card shadow-control",
            "opacity-70 hover:opacity-100 transition-smooth"
          )}
          onClick={goToPrevPage}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-10",
            "bg-card/80 backdrop-blur-sm hover:bg-card shadow-control",
            "opacity-70 hover:opacity-100 transition-smooth"
          )}
          onClick={goToNextPage}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Reader Controls */}
      <ReaderControls settings={settings} onChange={setSettings} />
    </div>
  );
};