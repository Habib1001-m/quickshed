'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

const labels = {
  en: {
    title: 'QR Code Generator',
    inputLabel: 'Text or URL',
    placeholder: 'Enter text or URL to encode...',
    size: 'Size (px)',
    fgColor: 'Foreground Color',
    bgColor: 'Background Color',
    download: 'Download PNG',
    copySvg: 'Copy SVG',
    copied: 'Copied!',
  },
  ar: {
    title: 'مولّد رمز QR',
    inputLabel: 'نص أو رابط',
    placeholder: 'أدخل نصاً أو رابطاً لتشفيره...',
    size: 'الحجم (بكسل)',
    fgColor: 'لون المقدمة',
    bgColor: 'لون الخلفية',
    download: 'تحميل PNG',
    copySvg: 'نسخ SVG',
    copied: 'تم النسخ!',
  },
};

export default function QrCodeGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataUrlRef = useRef('');

  const hasText = text.trim().length > 0;

  // Render QR to canvas (external system sync only, no setState)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasText) {
      dataUrlRef.current = '';
      return;
    }

    let cancelled = false;
    QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
    }).then(() => {
      if (!cancelled) {
        dataUrlRef.current = canvas.toDataURL('image/png');
      }
    }).catch(() => {
      if (!cancelled) {
        dataUrlRef.current = '';
      }
    });

    return () => { cancelled = true; };
  }, [text, size, fgColor, bgColor, hasText]);

  const handleDownload = useCallback(() => {
    if (!dataUrlRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrlRef.current;
    link.click();
  }, []);

  const handleCopySvg = useCallback(async () => {
    if (!hasText) return;
    try {
      const svgStr = await QRCode.toString(text, {
        type: 'svg',
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
      await navigator.clipboard.writeText(svgStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [text, fgColor, bgColor, hasText]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <QrCode className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.inputLabel}</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              className="tool-input font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{t.size}</Label>
              <Input
                type="number"
                min={64}
                max={1024}
                value={size}
                onChange={(e) => setSize(Math.max(64, Math.min(1024, parseInt(e.target.value) || 256)))}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.fgColor}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="size-10 rounded cursor-pointer border"
                />
                <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="tool-input font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.bgColor}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-10 rounded cursor-pointer border"
                />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="tool-input font-mono text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code display */}
      <Card>
        <CardContent className="pt-4 flex flex-col items-center gap-4">
          {hasText ? (
            <div className="rounded-lg border p-4 bg-white dark:bg-gray-950">
              <canvas ref={canvasRef} className="max-w-full" style={{ imageRendering: 'pixelated' }} />
            </div>
          ) : (
            <div className="flex items-center justify-center size-64 rounded-lg border-2 border-dashed text-muted-foreground">
              <QrCode className="size-16 opacity-30" />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleDownload} disabled={!hasText} variant="outline" className="gap-2">
              <Download className="size-4" />
              {t.download}
            </Button>
            <Button onClick={handleCopySvg} disabled={!hasText} variant="outline" className="gap-2">
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copySvg}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
