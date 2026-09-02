'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageDown, Download, Upload } from 'lucide-react';

const labels = {
  en: {
    title: 'Image Format Converter',
    dropzone: 'Drag & drop an image or click to upload',
    targetFormat: 'Target Format',
    quality: 'Quality',
    convert: 'Convert',
    download: 'Download',
    original: 'Original',
    converted: 'Converted',
    noImage: 'Upload an image to get started',
  },
  ar: {
    title: 'محول صيغة الصور',
    dropzone: 'اسحب وأسقط صورة أو انقر للرفع',
    targetFormat: 'الصيغة المستهدفة',
    quality: 'الجودة',
    convert: 'تحويل',
    download: 'تحميل',
    original: 'الأصلية',
    converted: 'المحوّلة',
    noImage: 'ارفع صورة للبدء',
  },
};

const FORMATS = ['PNG', 'JPEG', 'WebP'] as const;
type Format = (typeof FORMATS)[number];

export default function ImageFormatConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [image, setImage] = useState<string | null>(null);
  const [originalFormat, setOriginalFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState<Format>('PNG');
  const [quality, setQuality] = useState(92);
  const [converted, setConverted] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getMime = (fmt: Format) => {
    if (fmt === 'PNG') return 'image/png';
    if (fmt === 'JPEG') return 'image/jpeg';
    return 'image/webp';
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const ext = file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || '';
    setOriginalFormat(ext);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setConverted(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConvert = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const mime = getMime(targetFormat);
      canvas.toBlob((blob) => {
        if (blob) setConverted(URL.createObjectURL(blob));
      }, mime, quality / 100);
    };
    img.src = image;
  };

  const handleDownload = () => {
    if (!converted) return;
    const ext = targetFormat.toLowerCase();
    const a = document.createElement('a');
    a.href = converted;
    a.download = `converted.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ImageDown className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.dropzone}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {image && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.targetFormat}</label>
                  <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as Format)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(targetFormat === 'JPEG' || targetFormat === 'WebP') && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">{t.quality}: {quality}%</label>
                    <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={1} max={100} step={1} />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{t.original}: {originalFormat}</div>
              <div className="flex gap-2">
                <Button onClick={handleConvert} className="tool-action-btn flex items-center gap-2">
                  <ImageDown className="size-4" />{t.convert}
                </Button>
                {converted && (
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="size-4" />{t.download}
                  </Button>
                )}
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
          {converted && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t.converted} ({targetFormat})</CardTitle></CardHeader>
              <CardContent><img src={converted} alt={t.converted} className="max-w-full h-auto rounded" /></CardContent>
            </Card>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
