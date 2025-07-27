import { useState } from 'react';
import { Settings, Palette, Type, RotateCw, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { saveUserPreferences } from '@/db';

export type ReaderTheme = 'light' | 'sepia' | 'dark';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
}

interface ReaderControlsProps {
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
}

const fontOptions = [
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Nunito, sans-serif', label: 'Nunito' },
  { value: 'Pangolin, sans-serif', label: 'Pangolin' },
];

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Claro',
    bg: 'bg-white',
    text: 'text-black',
  },
  {
    value: 'sepia' as const,
    label: 'Sépia',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
  },
  {
    value: 'dark' as const,
    label: 'Escuro',
    bg: 'bg-gray-900',
    text: 'text-gray-100',
  },
];

export const ReaderControls = ({ settings, onChange }: ReaderControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
    saveUserPreferences({ [key]: value });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'rounded-full shadow-control bg-card/95 backdrop-blur-sm',
              'hover:bg-primary hover:text-primary-foreground transition-smooth'
            )}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-6 bg-card/95 backdrop-blur-sm shadow-reading border-border/50"
          side="left"
          align="start"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">
                Configurações de Leitura
              </h3>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Tema</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((theme) => (
                  <Button
                    key={theme.value}
                    variant={
                      settings.theme === theme.value ? 'default' : 'outline'
                    }
                    className={cn(
                      'h-auto p-3 flex flex-col items-center gap-2',
                      settings.theme === theme.value && 'ring-2 ring-primary'
                    )}
                    onClick={() => updateSetting('theme', theme.value)}
                  >
                    <div
                      className={cn(
                        'w-6 h-4 rounded border',
                        theme.bg,
                        theme.text
                      )}
                    />
                    <span className="text-xs">{theme.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Font Family */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Fonte</label>
              </div>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSetting('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">
                    Tamanho da Fonte
                  </label>
                </div>
                <span className="text-sm text-muted-foreground">
                  {settings.fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      Math.max(12, settings.fontSize - 2)
                    )
                  }
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSetting(
                      'fontSize',
                      Math.min(24, settings.fontSize + 2)
                    )
                  }
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Line Height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Espaçamento</label>
                </div>
                <span className="text-sm text-muted-foreground">
                  {settings.lineHeight.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[settings.lineHeight]}
                onValueChange={([value]) => updateSetting('lineHeight', value)}
                min={1.2}
                max={2.5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
