'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Upload, Copy, Check } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'Color Palette Extractor',
    dropzone: 'Drag & drop an image or click to upload',
    extract: 'Extract Colors',
    colors: 'Extracted Colors',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    copied: 'Copied!',
    copy: 'Copy',
    uploaded: 'Uploaded image',
    noImage: 'Upload an image to extract colors',
    invalidFile: 'Please choose an image file.',
    fileTooLarge: 'File is too large. Maximum size is 25 MB.',
    fileReadError: 'Unable to read the image.',
  },
  ar: {
    title: 'مستخرج لوحة الألوان',
    dropzone: 'اسحب وأسقط صورة أو انقر للرفع',
    extract: 'استخراج الألوان',
    colors: 'الألوان المستخرجة',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    uploaded: 'الصورة المرفوعة',
    noImage: 'ارفع صورة لاستخراج الألوان',
    invalidFile: 'يرجى اختيار ملف صورة.',
    fileTooLarge: 'الملف كبير جدًا. الحد الأقصى للحجم هو 25 ميجابايت.',
    fileReadError: 'تعذر قراءة الصورة.',
  },
};

interface ColorInfo {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  count: number;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function quantize(val: number, step: number): number {
  return Math.round(val / step) * step;
}

export default function ColorPaletteExtractor({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t.invalidFile);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.fileTooLarge);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setColors([]);
    };
    reader.onerror = () => setError(t.fileReadError);
    reader.readAsDataURL(file);
  }, [t.fileReadError, t.fileTooLarge, t.invalidFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const extractColors = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const maxDim = 200;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
      const step = 24;
      for (let i = 0; i < data.length; i += 4) {
        const r = quantize(data[i], step);
        const g = quantize(data[i + 1], step);
        const b = quantize(data[i + 2], step);
        const a = data[i + 3];
        if (a < 128) continue;
        const key = `${r},${g},${b}`;
        const existing = colorMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          colorMap.set(key, { r, g, b, count: 1 });
        }
      }
      const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);
      const result: ColorInfo[] = sorted.map((c) => {
        const [h, s, l] = rgbToHsl(c.r, c.g, c.b);
        return {
          hex: `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`,
          r: c.r, g: c.g, b: c.b,
          h, s, l,
          count: c.count,
        };
      });
      setColors(result);
    };
    img.src = image;
  };

  const copyColor = async (text: string, idx: number) => {
    setCopiedIdx(null);
    try {
      if (!await copyTextToClipboard(text)) {
        setCopiedIdx(null);
        return;
      }
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      setCopiedIdx(null);
    }
  };

  const totalCount = colors.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Palette className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={t.dropzone}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.dropzone}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          {image && (
            <>
              <img src={image} alt={t.uploaded} className="max-w-full h-auto rounded" />
              <Button onClick={extractColors} className="tool-action-btn flex items-center gap-2">
                <Palette className="size-4" />{t.extract}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {colors.length > 0 && (
        <Card className="tool-wrapper-card">
          <CardHeader className="pb-3">
            <CardTitle className="tool-section-title text-base">{t.colors}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colors.map((color, i) => {
                const pct = totalCount > 0 ? ((color.count / totalCount) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="size-12 rounded-lg shrink-0 border" style={{ backgroundColor: color.hex }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-bold flex items-center gap-2">
                        {color.hex}
                        <button
                          onClick={() => copyColor(color.hex, i)}
                          aria-label={`${t.copy} ${color.hex}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedIdx === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>{t.rgb}: rgb({color.r}, {color.g}, {color.b})</div>
                        <div>{t.hsl}: hsl({color.h}, {color.s}%, {color.l}%)</div>
                        <div>{pct}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
