import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.name.endsWith('.epub')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith('.epub')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed border-border bg-gradient-subtle",
        "transition-smooth hover:border-primary/50 hover:bg-muted/50",
        "cursor-pointer group"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={cn(
          "mb-6 p-4 rounded-full bg-primary/10 text-primary",
          "group-hover:bg-primary/20 transition-smooth"
        )}>
          {isLoading ? (
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {isLoading ? 'Processando arquivo...' : 'Upload do arquivo ePub'}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          Arraste e solte seu arquivo .epub aqui ou clique para selecionar
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <FileText className="w-4 h-4" />
          <span>Formatos aceitos: .epub</span>
        </div>

        <Button
          variant="default"
          disabled={isLoading}
          className="relative overflow-hidden bg-gradient-warm hover:opacity-90"
          asChild
        >
          <label>
            <input
              type="file"
              accept=".epub"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            {isLoading ? 'Carregando...' : 'Selecionar Arquivo'}
          </label>
        </Button>
      </div>
    </Card>
  );
};