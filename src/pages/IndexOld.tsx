import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { EpubReader } from '@/components/EpubReader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EpubViewer } from '@/components/EpubViewer';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    // Simulate processing time for better UX
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    setSelectedFile(file);
    setIsLoading(false);
  };

  const handleCloseReader = () => {
    setSelectedFile(null);
  };

  // if (selectedFile) {
  //   return <EpubReader file={selectedFile} onClose={handleCloseReader} />;
  // }
  if (selectedFile) {
    return <EpubViewer file={selectedFile} onClose={handleCloseReader} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-warm text-primary-foreground">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Leitor ePub
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Uma experiência de leitura moderna e personalizável para seus livros
            digitais
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Temas personalizáveis</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Controle de tipografia</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Interface intuitiva</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-reading hover:shadow-lg transition-smooth">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Leitura Confortável</h3>
            <p className="text-muted-foreground text-sm">
              Interface limpa e focada na leitura, com controles discretos que
              não distraem do conteúdo.
            </p>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-reading hover:shadow-lg transition-smooth">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Personalização Total</h3>
            <p className="text-muted-foreground text-sm">
              Ajuste cores, fontes, tamanhos e espaçamentos para criar a
              experiência de leitura perfeita para você.
            </p>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-reading hover:shadow-lg transition-smooth">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Navegação Intuitiva</h3>
            <p className="text-muted-foreground text-sm">
              Navegue facilmente pelo livro com controles de página, barra de
              progresso e atalhos de teclado.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
