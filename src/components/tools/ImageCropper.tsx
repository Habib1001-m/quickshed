'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crop, Download, Upload } from 'lucide-react';

const labels = {
  en: {
    title: 'Image Cropper',
    dropzone: 'Drag & drop an image or click to upload',
    aspectRatio: 'Aspect Ratio',
    free: 'Free',
    crop: 'Crop',
    download: 'Download',
    instructions: 'Click and drag on the image to select crop area',
    croppedResult: 'Cropped result',
  },
  ar: {
    title: 'قص الصور',
    dropzone: 'اسحب وأسقط صورة أو انقر للرفع',
    aspectRatio: 'نسبة الأبعاد',
    free: 'حر',
    crop: 'قص',
    download: 'تحميل',
    instructions: 'انقر واسحب على الصورة لتحديد منطقة القص',
    croppedResult: 'نتيجة القص',
  },
};

const ASPECT_RATIOS: { label: string; value: string; ratio: number | null }[] = [
  { label: 'Free', value: 'free', ratio: null },
  { label: '1:1', value: '1:1', ratio: 1 },
  { label: '4:3', value: '4:3', ratio: 4 / 3 },
  { label: '16:9', value: '16:9', ratio: 16 / 9 },
  { label: '3:2', value: '3:2', ratio: 3 / 2 },
];

export default function ImageCropper({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [image, setImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImage(e.target?.result as string);
        setCropRect(null);
        setCroppedImage(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !imgRef.current) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = imgRef.current.width / rect.width;
    const scaleY = imgRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDragging(true);
    setDragStart(coords);
    setCropRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const coords = getCanvasCoords(e);
    let w = coords.x - dragStart.x;
    let h = coords.y - dragStart.y;
    if (aspectRatio) {
      h = w / aspectRatio;
      if (h < 0) h = -h;
      if (w < 0) h = -h;
    }
    setCropRect({ x: dragStart.x, y: dragStart.y, w, h });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Draw canvas with crop overlay
  useEffect(() => {
    if (!image || !displayCanvasRef.current || !imgRef.current) return;
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!container) return;
    const maxW = container.clientWidth;
    const scale = Math.min(maxW / img.width, 500 / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (cropRect) {
      const s = scale;
      const cx = cropRect.x * s;
      const cy = cropRect.y * s;
      const cw = cropRect.w * s;
      const ch = cropRect.h * s;
      // Darken outside
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Clear crop area
      const x = cw > 0 ? cx : cx + cw;
      const y = ch > 0 ? cy : cy + ch;
      const w = Math.abs(cw);
      const h = Math.abs(ch);
      ctx.clearRect(x, y, w, h);
      ctx.drawImage(img, x / s, y / s, w / s, h / s, x, y, w, h);
      // Border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }
  }, [image, cropRect]);

  const handleCrop = () => {
    if (!cropRect || !imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgRef.current;
    const x = cropRect.w > 0 ? cropRect.x : cropRect.x + cropRect.w;
    const y = cropRect.h > 0 ? cropRect.y : cropRect.y + cropRect.h;
    const w = Math.abs(cropRect.w);
    const h = Math.abs(cropRect.h);
    if (w < 5 || h < 5) return;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (blob) setCroppedImage(URL.createObjectURL(blob));
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!croppedImage) return;
    const a = document.createElement('a');
    a.href = croppedImage;
    a.download = 'cropped_image.png';
    a.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Crop className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!image && (
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
          )}

          {image && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={aspectRatio === null ? 'free' : aspectRatio === 1 ? '1:1' : aspectRatio === 4 / 3 ? '4:3' : aspectRatio === 16 / 9 ? '16:9' : '3:2'}
                  onValueChange={(v) => {
                    const found = ASPECT_RATIOS.find((r) => r.value === v);
                    setAspectRatio(found?.ratio ?? null);
                  }}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCrop} disabled={!cropRect} className="tool-action-btn flex items-center gap-2">
                  <Crop className="size-4" />{t.crop}
                </Button>
                {croppedImage && (
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="size-4" />{t.download}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t.instructions}</p>
              <div ref={containerRef}>
                <canvas
                  ref={displayCanvasRef}
                  className="rounded border cursor-crosshair max-w-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {croppedImage && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t.croppedResult}</CardTitle></CardHeader>
          <CardContent><img src={croppedImage} alt={t.croppedResult} className="max-w-full h-auto rounded" /></CardContent>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
