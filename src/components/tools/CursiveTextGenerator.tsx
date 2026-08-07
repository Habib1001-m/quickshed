'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Sparkles } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'Cursive Text Generator',
    inputPlaceholder: 'Type your text here...',
    bold: 'Bold',
    italic: 'Italic',
    boldItalic: 'Bold Italic',
    script: 'Script',
    scriptBold: 'Script Bold',
    fraktur: 'Fraktur',
    frakturBold: 'Fraktur Bold',
    monospace: 'Monospace',
    circled: 'Circled',
    squared: 'Squared',
    copied: 'Copied!',
    copy: 'Copy',
  },
  ar: {
    title: 'مولّد النصوص الزخرفية',
    inputPlaceholder: 'اكتب نصك هنا...',
    bold: 'عريض',
    italic: 'مائل',
    boldItalic: 'عريض مائل',
    script: 'خط يدوي',
    scriptBold: 'خط يدوي عريض',
    fraktur: 'غوثي',
    frakturBold: 'غوثي عريض',
    monospace: 'ثابت العرض',
    circled: 'دائري',
    squared: 'مربع',
    copied: 'تم النسخ!',
    copy: 'نسخ',
  },
};

// Unicode conversion maps
const BOLD_MAP: Record<string, string> = {};
const ITALIC_MAP: Record<string, string> = {};
const BOLD_ITALIC_MAP: Record<string, string> = {};
const SCRIPT_MAP: Record<string, string> = {};
const SCRIPT_BOLD_MAP: Record<string, string> = {};
const FRAKTUR_MAP: Record<string, string> = {};
const FRAKTUR_BOLD_MAP: Record<string, string> = {};
const MONOSPACE_MAP: Record<string, string> = {};
const CIRCLED_MAP: Record<string, string> = {};
const SQUARED_MAP: Record<string, string> = {};

// Build maps from Unicode ranges
function buildMaps() {
  // Bold: U+1D400 (A) - U+1D419 (Z), U+1D41A (a) - U+1D433 (z)
  for (let i = 0; i < 26; i++) {
    BOLD_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D400 + i);
    BOLD_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D41A + i);
  }
  // Bold digits
  for (let i = 0; i < 10; i++) {
    BOLD_MAP[String(i)] = String.fromCodePoint(0x1D7CE + i);
  }

  // Italic: U+1D434 (A) - U+1D44D (Z), U+1D44E (a) - U+1D467 (z)
  for (let i = 0; i < 26; i++) {
    ITALIC_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D434 + i);
    ITALIC_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D44E + i);
  }

  // Bold Italic: U+1D468 (A) - U+1D481 (Z), U+1D482 (a) - U+1D49B (z)
  for (let i = 0; i < 26; i++) {
    BOLD_ITALIC_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D468 + i);
    BOLD_ITALIC_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D482 + i);
  }

  // Script: U+1D49C (A), skip h, U+1D4B6 (a) - U+1D4CF (z)
  const scriptUpper: Record<number, number> = {
    72: 0x210B, // h -> ℋ
  };
  for (let i = 0; i < 26; i++) {
    const ch = 65 + i;
    SCRIPT_MAP[String.fromCharCode(ch)] = scriptUpper[ch]
      ? String.fromCodePoint(scriptUpper[ch])
      : String.fromCodePoint(0x1D49C + i);
    SCRIPT_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D4B6 + i);
  }

  // Script Bold: U+1D4D0 (A) - U+1D4E9 (Z), U+1D4EA (a) - U+1D503 (z)
  for (let i = 0; i < 26; i++) {
    SCRIPT_BOLD_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D4D0 + i);
    SCRIPT_BOLD_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D4EA + i);
  }

  // Fraktur: U+1D504 (A) - U+1D51D (Z), U+1D51E (a) - U+1D537 (z)
  const frakturUpper: Record<number, number> = {
    67: 0x212D, // C -> ℭ
    72: 0x210C, // H -> ℌ
    73: 0x2111, // I -> ℑ
    82: 0x211C, // R → ℜ
    90: 0x2128, // Z → ℨ
  };
  for (let i = 0; i < 26; i++) {
    const ch = 65 + i;
    FRAKTUR_MAP[String.fromCharCode(ch)] = frakturUpper[ch]
      ? String.fromCodePoint(frakturUpper[ch])
      : String.fromCodePoint(0x1D504 + i);
    FRAKTUR_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D51E + i);
  }

  // Fraktur Bold: U+1D56C (A) - U+1D585 (Z), U+1D586 (a) - U+1D59F (z)
  for (let i = 0; i < 26; i++) {
    FRAKTUR_BOLD_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D56C + i);
    FRAKTUR_BOLD_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D586 + i);
  }

  // Monospace: U+1D670 (A) - U+1D689 (Z), U+1D68A (a) - U+1D6A3 (z)
  for (let i = 0; i < 26; i++) {
    MONOSPACE_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D670 + i);
    MONOSPACE_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D68A + i);
  }
  for (let i = 0; i < 10; i++) {
    MONOSPACE_MAP[String(i)] = String.fromCodePoint(0x1D7F6 + i);
  }

  // Circled: U+24B6 (A) - U+24CF (Z), U+24D0 (a) - U+24E9 (z)
  for (let i = 0; i < 26; i++) {
    CIRCLED_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x24B6 + i);
    CIRCLED_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x24D0 + i);
  }
  for (let i = 0; i < 10; i++) {
    CIRCLED_MAP[String(i)] = String.fromCodePoint(0x2460 + i - 1); // 1-9 then 10+
    if (i === 0) CIRCLED_MAP['0'] = String.fromCodePoint(0x24EA); // ⓪
  }

  // Squared: U+1F130 (A) - U+1F149 (Z)
  for (let i = 0; i < 26; i++) {
    SQUARED_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1F130 + i);
    SQUARED_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1F130 + i);
  }
}

buildMaps();

function convertWithMap(text: string, map: Record<string, string>): string {
  return [...text].map((c) => map[c] || c).join('');
}

interface StyleDef {
  key: string;
  labelKey: keyof typeof labels.en;
  map: Record<string, string>;
}

const STYLES: StyleDef[] = [
  { key: 'bold', labelKey: 'bold', map: BOLD_MAP },
  { key: 'italic', labelKey: 'italic', map: ITALIC_MAP },
  { key: 'boldItalic', labelKey: 'boldItalic', map: BOLD_ITALIC_MAP },
  { key: 'script', labelKey: 'script', map: SCRIPT_MAP },
  { key: 'scriptBold', labelKey: 'scriptBold', map: SCRIPT_BOLD_MAP },
  { key: 'fraktur', labelKey: 'fraktur', map: FRAKTUR_MAP },
  { key: 'frakturBold', labelKey: 'frakturBold', map: FRAKTUR_BOLD_MAP },
  { key: 'monospace', labelKey: 'monospace', map: MONOSPACE_MAP },
  { key: 'circled', labelKey: 'circled', map: CIRCLED_MAP },
  { key: 'squared', labelKey: 'squared', map: SQUARED_MAP },
];

export default function CursiveTextGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results = useMemo(() => {
    return STYLES.map((style) => ({
      ...style,
      output: convertWithMap(text, style.map),
    }));
  }, [text]);

  const handleCopy = async (key: string, output: string) => {
    setCopiedKey(null);
    if (await copyTextToClipboard(output)) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      setCopiedKey(null);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Sparkles className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input text-base"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((result) => (
          <Card key={result.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t[result.labelKey]}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(result.key, result.output)}
                disabled={!result.output}
              >
                {copiedKey === result.key ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copiedKey === result.key ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="tool-output rounded-md border bg-muted/30 p-3 min-h-[48px] text-lg break-all select-all">
                {result.output || <span className="text-muted-foreground text-sm">{t.inputPlaceholder}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
