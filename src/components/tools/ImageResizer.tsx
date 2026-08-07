'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scaling, Download, Upload } from 'lucide-react';

const labels = {
  en: {
    title: 'Image Resizer',
    dropzone: 'Drag & drop an image or click to upload',
    width: 'Width',
    height: 'Height',
    maintainAspect: 'Maintain Aspect Ratio',
    preset: 'Preset Size',
    custom: 'Custom',
    resize: 'Resize',
    download: 'Download',
    original: 'Original',
    resized: 'Resized',
    pixels: 'px',
    noImage: 'Upload an image to get started',
    invalidFile: 'Please choose an image file.',
    fileTooLarge: 'File is too large. Maximum size is 25 MB.',
    fileReadError: 'Unable to read the image.',
  },
  ar: {
    title: 'تغيير حجم الصورة',
    dropzone: 'اسحب وأسقط صورة أو انقر للرفع',
    width: 'العرض',
    height: 'الارتفاع',
    maintainAspect: 'الحفاظ على نسبة الأبعاد',
    preset: 'حجم مسبق',
    custom: 'مخصص',
    resize: 'تغيير الحجم',
    download: 'تحميل',
    original: 'الأصلية',
    resized: 'المعدلة',
    pixels: 'بكسل',
    noImage: 'ارفع صورة للبدء',
    invalidFile: 'يرجى اختيار ملف صورة.',
    fileTooLarge: 'الملف كبير جدًا. الحد الأقصى للحجم هو 25 ميجابايت.',
    fileReadError: 'تعذر قراءة الصورة.',
  },
};

const PRESETS = [
  { label: '1920×1080', w: 1920, h: 1080 },
  { label: '1280×720', w: 1280, h: 720 },
  { label: '800×600', w: 800, h: 600 },
  { label: '512×512', w: 512, h: 512 },
  { label: '256×256', w: 256, h: 256 },
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function ImageResizer({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [resizedFileSize, setResizedFileSize] = useState(0);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setOriginalFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target?.result as string);
        setOriginalSize({ w: img.width, h: img.height });
        setNewWidth(img.width);
        setNewHeight(img.height);
        setResizedImage(null);
      };
      img.src = e.target?.result as string;
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

  const handleWidthChange = (val: number) => {
    setNewWidth(val);
    if (maintainAspect && originalSize.w > 0) {
      setNewHeight(Math.round((val / originalSize.w) * originalSize.h));
    }
  };

  const handleHeightChange = (val: number) => {
    setNewHeight(val);
    if (maintainAspect && originalSize.h > 0) {
      setNewWidth(Math.round((val / originalSize.h) * originalSize.w));
    }
  };

  const applyPreset = (val: string) => {
    const preset = PRESETS.find((p) => p.label === val);
    if (preset) {
      setNewWidth(preset.w);
      setNewHeight(preset.h);
    }
  };

  const handleResize = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          setResizedFileSize(blob.size);
          const url = URL.createObjectURL(blob);
          setResizedImage(url);
        }
      }, 'image/png');
    };
    img.src = image;
  };

  const handleDownload = () => {
    if (!resizedImage) return;
    const a = document.createElement('a');
    a.href = resizedImage;
    a.download = `resized_${newWidth}x${newHeight}.png`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Scaling className="size-5" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.width} ({t.pixels})</Label>
                  <Input type="number" value={newWidth} onChange={(e) => handleWidthChange(Number(e.target.value))} min={1} className="tool-input" />
                </div>
                <div className="space-y-2">
                  <Label>{t.height} ({t.pixels})</Label>
                  <Input type="number" value={newHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} min={1} className="tool-input" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={maintainAspect} onCheckedChange={setMaintainAspect} />
                <Label>{t.maintainAspect}</Label>
              </div>
              <div className="space-y-2">
                <Label>{t.preset}</Label>
                <Select onValueChange={applyPreset}>
                  <SelectTrigger><SelectValue placeholder={t.custom} /></SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleResize} className="tool-action-btn flex items-center gap-2">
                  <Scaling className="size-4" />{t.resize}
                </Button>
                {resizedImage && (
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="size-4" />{t.download}
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.original}: {originalSize.w}×{originalSize.h} ({formatSize(originalFileSize)})
                {resizedImage && ` → ${t.resized}: ${newWidth}×${newHeight} (${formatSize(resizedFileSize)})`}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {image && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t.original}</CardTitle></CardHeader>
            <CardContent><img src={image} alt={t.original} className="max-w-full h-auto rounded" /></CardContent>
          </Card>
          {resizedImage && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t.resized} ({newWidth}×{newHeight})</CardTitle></CardHeader>
              <CardContent><img src={resizedImage} alt={t.resized} className="max-w-full h-auto rounded" /></CardContent>
            </Card>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
