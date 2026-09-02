'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Check, Palette } from 'lucide-react';

const labels = {
  en: {
    title: 'Color Converter',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    red: 'R',
    green: 'G',
    blue: 'B',
    hue: 'H',
    saturation: 'S',
    lightness: 'L',
    preview: 'Preview',
    copied: 'Copied!',
    copy: 'Copy',
    invalidColor: 'Invalid color value',
    enterHex: 'Enter HEX color (e.g. #FF5733)',
  },
  ar: {
    title: 'محول الألوان',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    red: 'أحمر',
    green: 'أخضر',
    blue: 'أزرق',
    hue: 'درجة',
    saturation: 'تشبع',
    lightness: 'إضاءة',
    preview: 'معاينة',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    invalidColor: 'قيمة لون غير صالحة',
    enterHex: 'أدخل لون HEX (مثال: #FF5733)',
  },
};

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function ColorCopyButton({ field, value, copiedField, onCopy, copiedLabel, copyLabel }: {
  field: string;
  value: string;
  copiedField: string | null;
  onCopy: (field: string, value: string) => void;
  copiedLabel: string;
  copyLabel: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onCopy(field, value)}
      className="h-7 px-2"
    >
      {copiedField === field ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span className="text-xs ml-1">{copiedField === field ? copiedLabel : copyLabel}</span>
    </Button>
  );
}

export default function ColorConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [hexInput, setHexInput] = useState('#3B82F6');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb) : null, [rgb]);
  const hex = useMemo(() => rgb ? rgbToHex(rgb) : null, [rgb]);

  const handleCopy = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // No false positive success.
    }
  }, []);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <Palette className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>{t.hex}</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={hexInput.length >= 4 ? hexInput.substring(0, 7) : '#000000'}
                  onChange={(e) => setHexInput(e.target.value)}
                  className="h-10 w-12 rounded border cursor-pointer"
                />
                <Input
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder={t.enterHex}
                  className="tool-input font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="tool-wrapper-card">
        <CardContent className="p-4 sm:p-6">
          <div
            className="h-24 rounded-lg border transition-colors duration-300"
            style={{ backgroundColor: rgb ? hexInput : 'transparent' }}
          />
        </CardContent>
      </Card>

      {rgb && hsl && hex && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="tool-wrapper-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.hex}</CardTitle>
              <ColorCopyButton field="hex" value={hex} copiedField={copiedField} onCopy={handleCopy} copiedLabel={t.copied} copyLabel={t.copy} />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="tool-output text-xl font-bold font-mono text-primary select-all">{hex}</div>
            </CardContent>
          </Card>

          <Card className="tool-wrapper-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.rgb}</CardTitle>
              <ColorCopyButton field="rgb" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} copiedField={copiedField} onCopy={handleCopy} copiedLabel={t.copied} copyLabel={t.copy} />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="tool-output text-xl font-bold font-mono text-primary select-all">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                <div>{t.red}: {rgb.r}</div>
                <div>{t.green}: {rgb.g}</div>
                <div>{t.blue}: {rgb.b}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="tool-wrapper-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.hsl}</CardTitle>
              <ColorCopyButton field="hsl" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} copiedField={copiedField} onCopy={handleCopy} copiedLabel={t.copied} copyLabel={t.copy} />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="tool-output text-xl font-bold font-mono text-primary select-all">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                <div>{t.hue}: {hsl.h}°</div>
                <div>{t.saturation}: {hsl.s}%</div>
                <div>{t.lightness}: {hsl.l}%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
