'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Palette } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'Color Picker',
    pickColor: 'Pick a Color',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    copy: 'Copy',
    copied: 'Copied!',
    complementary: 'Complementary',
    analogous: 'Analogous',
    triadic: 'Triadic',
    palette: 'Color Palette',
  },
  ar: {
    title: 'منتقي الألوان',
    pickColor: 'اختر لوناً',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    complementary: 'مكمل',
    analogous: 'متماثل',
    triadic: 'ثلاثي',
    palette: 'لوحة الألوان',
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function generatePalette(hex: string): { complementary: string[]; analogous: string[]; triadic: string[] } {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const complementary = [
    rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)) as [number, number, number]),
  ];

  const analogous = [
    rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)) as [number, number, number]),
    rgbToHex(...Object.values(hslToRgb((hsl.h + 330) % 360, hsl.s, hsl.l)) as [number, number, number]),
  ];

  const triadic = [
    rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)) as [number, number, number]),
    rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)) as [number, number, number]),
  ];

  return { complementary, analogous, triadic };
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    setCopied(false);
    if (await copyTextToClipboard(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };
  return (
    <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  );
}

export default function ColorPicker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [hex, setHex] = useState('#6366f1');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const palette = useMemo(() => generatePalette(hex), [hex]);

  const handleHexInput = (val: string) => {
    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
      setHex(val);
    }
  };

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Palette className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color preview + picker */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div
              className="size-32 rounded-xl border-2 shadow-lg"
              style={{ backgroundColor: hex }}
            />
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="size-16 rounded-lg cursor-pointer border"
            />
            <div className="flex-1 w-full">
              <Label className="mb-2 block">{t.pickColor}</Label>
              <Input
                value={hex}
                onChange={(e) => handleHexInput(e.target.value)}
                className="tool-input font-mono text-lg"
              />
            </div>
          </div>

          {/* Color values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{t.hex}</div>
                <div className="font-mono text-sm">{hex.toUpperCase()}</div>
              </div>
              <CopyButton value={hex.toUpperCase()} />
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{t.rgb}</div>
                <div className="font-mono text-sm">{rgbStr}</div>
              </div>
              <CopyButton value={rgbStr} />
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{t.hsl}</div>
                <div className="font-mono text-sm">{hslStr}</div>
              </div>
              <CopyButton value={hslStr} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Palette suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.palette}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { label: t.complementary, colors: palette.complementary },
            { label: t.analogous, colors: palette.analogous },
            { label: t.triadic, colors: palette.triadic },
          ] as const).map(({ label, colors }) => (
            <div key={label}>
              <div className="text-sm text-muted-foreground mb-2">{label}</div>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setHex(c)}
                    className="group relative size-14 rounded-lg border shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono font-bold" style={{ color: hsl.l > 50 ? '#000' : '#fff' }}>
                      {c}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
