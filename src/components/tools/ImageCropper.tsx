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
    keyboardInstructions: 'Focus the image area, press Enter or Space to select a centered area, use Arrow keys to move it, and Shift + Arrow keys to resize it.',
    cropAreaLabel: 'Image crop area',
    croppedResult: 'Cropped Result',
    cropped: 'Cropped',
    invalidFile: 'Please choose an image file.',
    fileTooLarge: 'File is too large. Maximum size is 25 MB.',
    fileReadError: 'Unable to read the image.',
    minimumCropSize: 'Select a crop area at least 5 × 5 pixels.',
    cropError: 'Unable to create the cropped image.',
  },
  ar: {
    title: 'قص الصور',
    dropzone: 'اسحب وأسقط صورة أو انقر للرفع',
    aspectRatio: 'نسبة الأبعاد',
    free: 'حر',
    crop: 'قص',
    download: 'تحميل',
    instructions: 'انقر واسحب على الصورة لتحديد منطقة القص',
    keyboardInstructions: 'حدّد منطقة الصورة ثم اضغط Enter أو مسافة لاختيار منطقة وسطية، واستخدم الأسهم لتحريكها، مع Shift + الأسهم لتغيير حجمها.',
    cropAreaLabel: 'منطقة قص الصورة',
    croppedResult: 'نتيجة القص',
    cropped: 'الصورة المقصوصة',
    invalidFile: 'يرجى اختيار ملف صورة.',
    fileTooLarge: 'الملف كبير جدًا. الحد الأقصى للحجم هو 25 ميجابايت.',
    fileReadError: 'تعذر قراءة الصورة.',
    minimumCropSize: 'اختر منطقة قص لا تقل عن 5 × 5 بكسل.',
    cropError: 'تعذر إنشاء الصورة المقصوصة.',
  },
};

const ASPECT_RATIOS: { value: string; ratio: number | null }[] = [
  { value: 'free', ratio: null },
  { value: '1:1', ratio: 1 },
  { value: '4:3', ratio: 4 / 3 },
  { value: '16:9', ratio: 16 / 9 },
  { value: '3:2', ratio: 3 / 2 },
];

type CropRect = { x: number; y: number; w: number; h: number };
type CropSize = { w: number; h: number };
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MIN_CROP_SIZE = 5;
const KEYBOARD_STEP = 5;

function normalizeCropRect(rect: CropRect): CropRect {
  return {
    x: rect.w >= 0 ? rect.x : rect.x + rect.w,
    y: rect.h >= 0 ? rect.y : rect.y + rect.h,
    w: Math.abs(rect.w),
    h: Math.abs(rect.h),
  };
}

function getAspectSize(width: number, height: number, aspectRatio: number): CropSize {
  const absoluteWidth = Math.abs(width);
  const absoluteHeight = Math.abs(height);
  if (absoluteWidth >= absoluteHeight * aspectRatio) {
    return { w: absoluteWidth, h: absoluteWidth / aspectRatio };
  }
  return { w: absoluteHeight * aspectRatio, h: absoluteHeight };
}

function fitAspectSizeWithinBounds(size: CropSize, maxWidth: number, maxHeight: number): CropSize {
  if (size.w <= 0 || size.h <= 0) return { w: 0, h: 0 };
  const scale = Math.max(0, Math.min(1, maxWidth / size.w, maxHeight / size.h));
  return { w: size.w * scale, h: size.h * scale };
}

function getMinimumAspectSize(aspectRatio: number): CropSize {
  const w = Math.max(MIN_CROP_SIZE, MIN_CROP_SIZE * aspectRatio);
  const h = Math.max(MIN_CROP_SIZE, MIN_CROP_SIZE / aspectRatio);
  return { w, h };
}

export default function ImageCropper({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [image, setImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImage(e.target?.result as string);
        setCropRect(null);
        setCroppedImage(null);
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

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !imgRef.current) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = imgRef.current.width / Math.max(rect.width, 1);
    const scaleY = imgRef.current.height / Math.max(rect.height, 1);
    return {
      x: Math.min(imgRef.current.width, Math.max(0, (e.clientX - rect.left) * scaleX)),
      y: Math.min(imgRef.current.height, Math.max(0, (e.clientY - rect.top) * scaleY)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const coords = getCanvasCoords(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    setError('');
    setIsDragging(true);
    setDragStart(coords);
    setCropRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const coords = getCanvasCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;
    const img = imgRef.current;
    if (!img) return;

    const maxWidth = deltaX < 0 ? dragStart.x : img.width - dragStart.x;
    const maxHeight = deltaY < 0 ? dragStart.y : img.height - dragStart.y;
    const requestedSize = aspectRatio
      ? getAspectSize(deltaX, deltaY, aspectRatio)
      : { w: Math.abs(deltaX), h: Math.abs(deltaY) };
    const size = aspectRatio
      ? fitAspectSizeWithinBounds(requestedSize, maxWidth, maxHeight)
      : {
          w: Math.min(requestedSize.w, maxWidth),
          h: Math.min(requestedSize.h, maxHeight),
        };

    setCropRect({
      x: deltaX < 0 ? dragStart.x - size.w : dragStart.x,
      y: deltaY < 0 ? dragStart.y - size.h : dragStart.y,
      w: deltaX < 0 ? -size.w : size.w,
      h: deltaY < 0 ? -size.h : size.h,
    });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
      const normalized = normalizeCropRect(cropRect);
      const cx = normalized.x * s;
      const cy = normalized.y * s;
      const cw = normalized.w * s;
      const ch = normalized.h * s;
      // Darken outside
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Clear crop area
      ctx.clearRect(cx, cy, cw, ch);
      ctx.drawImage(img, normalized.x, normalized.y, normalized.w, normalized.h, cx, cy, cw, ch);
      // Border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);
    }
  }, [image, cropRect]);

  const handleCrop = () => {
    if (!cropRect || !imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgRef.current;
    const normalized = normalizeCropRect(cropRect);
    const x = Math.max(0, Math.min(normalized.x, img.width));
    const y = Math.max(0, Math.min(normalized.y, img.height));
    const w = Math.min(normalized.w, img.width - x);
    const h = Math.min(normalized.h, img.height - y);
    if (w < MIN_CROP_SIZE || h < MIN_CROP_SIZE) {
      setError(t.minimumCropSize);
      return;
    }
    setError('');
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (blob) setCroppedImage(URL.createObjectURL(blob));
      else setError(t.cropError);
    }, 'image/png');
  };

  const getDefaultCropRect = useCallback((): CropRect | null => {
    const img = imgRef.current;
    if (!img) return null;
    let w = Math.min(img.width, Math.max(MIN_CROP_SIZE, Math.round(img.width * 0.5)));
    let h = Math.min(img.height, Math.max(MIN_CROP_SIZE, Math.round(img.height * 0.5)));
    if (aspectRatio) {
      const size = fitAspectSizeWithinBounds(getAspectSize(w, h, aspectRatio), img.width, img.height);
      w = size.w;
      h = size.h;
    }
    return {
      x: Math.max(0, Math.round((img.width - w) / 2)),
      y: Math.max(0, Math.round((img.height - h) / 2)),
      w,
      h,
    };
  }, [aspectRatio]);

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!imgRef.current) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCropRect(getDefaultCropRect());
      setError('');
      return;
    }

    const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight';
    if (!isArrow) return;
    e.preventDefault();
    const img = imgRef.current;
    const current = normalizeCropRect(cropRect ?? getDefaultCropRect() ?? { x: 0, y: 0, w: 0, h: 0 });
    let { x, y, w, h } = current;

    if (e.shiftKey && aspectRatio) {
      const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      const delta = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? KEYBOARD_STEP : -KEYBOARD_STEP;
      const minimumSize = getMinimumAspectSize(aspectRatio);
      const currentPrimary = horizontal ? w : h;
      const minimumPrimary = horizontal ? minimumSize.w : minimumSize.h;
      const primary = Math.max(minimumPrimary, currentPrimary + delta);
      const requestedSize = horizontal
        ? { w: primary, h: primary / aspectRatio }
        : { w: primary * aspectRatio, h: primary };
      const size = fitAspectSizeWithinBounds(requestedSize, img.width, img.height);
      w = size.w;
      h = size.h;
      x = Math.max(0, Math.min(x, img.width - w));
      y = Math.max(0, Math.min(y, img.height - h));
    } else if (e.shiftKey) {
      const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      const delta = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? KEYBOARD_STEP : -KEYBOARD_STEP;
      if (horizontal) {
        w = Math.max(MIN_CROP_SIZE, Math.min(img.width, w + delta));
      } else {
        h = Math.max(MIN_CROP_SIZE, Math.min(img.height, h + delta));
      }
      w = Math.min(w, img.width);
      h = Math.min(h, img.height);
      x = Math.min(x, img.width - w);
      y = Math.min(y, img.height - h);
    } else {
      const deltaX = e.key === 'ArrowLeft' ? -KEYBOARD_STEP : e.key === 'ArrowRight' ? KEYBOARD_STEP : 0;
      const deltaY = e.key === 'ArrowUp' ? -KEYBOARD_STEP : e.key === 'ArrowDown' ? KEYBOARD_STEP : 0;
      x = Math.max(0, Math.min(img.width - w, x + deltaX));
      y = Math.max(0, Math.min(img.height - h, y + deltaY));
    }

    setCropRect({ x, y, w, h });
    setError('');
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-label={t.dropzone} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

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
                  <SelectTrigger className="w-[140px]" aria-label={t.aspectRatio}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.ratio === null ? t.free : r.value}</SelectItem>
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
              <p id="crop-keyboard-instructions" className="text-xs text-muted-foreground">
                {t.instructions} {t.keyboardInstructions}
              </p>
              <div ref={containerRef}>
                <canvas
                  ref={displayCanvasRef}
                  className="rounded border cursor-crosshair max-w-full touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  onKeyDown={handleCanvasKeyDown}
                  tabIndex={0}
                  aria-label={t.cropAreaLabel}
                  aria-describedby="crop-keyboard-instructions"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {croppedImage && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t.croppedResult}</CardTitle></CardHeader>
          <CardContent><img src={croppedImage} alt={t.cropped} className="max-w-full h-auto rounded" /></CardContent>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
