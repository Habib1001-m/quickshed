'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barcode, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const labels = {
  en: {
    title: 'Barcode Generator',
    inputLabel: 'Text / Number',
    placeholder: 'Enter text or number...',
    format: 'Format',
    width: 'Bar Width',
    height: 'Height',
    download: 'Download PNG',
    invalidInput: 'Invalid input for the selected format',
  },
  ar: {
    title: 'مولّد الباركود',
    inputLabel: 'نص / رقم',
    placeholder: 'أدخل نصاً أو رقماً...',
    format: 'التنسيق',
    width: 'عرض الشريط',
    height: 'الارتفاع',
    download: 'تحميل PNG',
    invalidInput: 'إدخال غير صالح للتنسيق المحدد',
  },
};

const FORMATS = [
  { value: 'CODE128', label: 'CODE 128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'UPC', label: 'UPC' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'CODE39', label: 'CODE 39' },
];

// Validate barcode input without rendering
function isValidBarcode(text: string, format: string): boolean {
  if (!text.trim()) return true; // empty is valid (no error shown)
  try {
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(tempSvg, text, { format: format as string });
    return true;
  } catch {
    return false;
  }
}

export default function BarcodeGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [text, setText] = useState('');
  const [format, setFormat] = useState('CODE128');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(100);
  const svgRef = useRef<SVGSVGElement>(null);

  const hasText = text.trim().length > 0;
  const isValid = useMemo(() => isValidBarcode(text, format), [text, format]);

  // Render barcode to SVG (external system sync only, no setState)
  useEffect(() => {
    if (!hasText || !svgRef.current) return;
    try {
      JsBarcode(svgRef.current, text, {
        format: format as string,
        width: barWidth,
        height: barHeight,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
    } catch {
      // Error state handled by isValid computation
    }
  }, [text, format, barWidth, barHeight, hasText]);

  const handleDownload = () => {
    if (!svgRef.current || !isValid) return;
    const svg = svgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'barcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Barcode className="size-5" />
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
              className="tool-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{t.format}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.width}</Label>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.5}
                value={barWidth}
                onChange={(e) => setBarWidth(parseFloat(e.target.value) || 2)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.height}</Label>
              <Input
                type="number"
                min={30}
                max={300}
                value={barHeight}
                onChange={(e) => setBarHeight(parseInt(e.target.value) || 100)}
                className="tool-input"
              />
            </div>
          </div>

          {hasText && !isValid && <p className="text-sm text-destructive">{t.invalidInput}</p>}
        </CardContent>
      </Card>

      {/* Barcode display */}
      <Card>
        <CardContent className="pt-4 flex flex-col items-center gap-4">
          {hasText && isValid ? (
            <div className="rounded-lg border p-4 bg-white dark:bg-gray-950">
              <svg ref={svgRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center size-48 rounded-lg border-2 border-dashed text-muted-foreground">
              <Barcode className="size-16 opacity-30" />
            </div>
          )}

          <Button onClick={handleDownload} disabled={!hasText || !isValid} variant="outline" className="gap-2">
            <Download className="size-4" />
            {t.download}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
