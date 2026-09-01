'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Binary } from 'lucide-react';

const labels = {
  en: {
    title: 'Number Base Converter',
    binary: 'Binary',
    octal: 'Octal',
    decimal: 'Decimal',
    hexadecimal: 'Hexadecimal',
    enterNumber: 'Enter a number',
    selectBase: 'Input base',
    invalidDigit: 'Invalid digit for selected base',
    bases: {
      binary: 'Binary (2)',
      octal: 'Octal (8)',
      decimal: 'Decimal (10)',
      hexadecimal: 'Hexadecimal (16)',
    },
  },
  ar: {
    title: 'محول أساس الأرقام',
    binary: 'ثنائي',
    octal: 'ثماني',
    decimal: 'عشري',
    hexadecimal: 'سداسي عشر',
    enterNumber: 'أدخل رقماً',
    selectBase: 'أساس الإدخال',
    invalidDigit: 'رقم غير صالح للأساس المحدد',
    bases: {
      binary: 'ثنائي (2)',
      octal: 'ثماني (8)',
      decimal: 'عشري (10)',
      hexadecimal: 'سداسي عشر (16)',
    },
  },
};

type BaseType = 'binary' | 'octal' | 'decimal' | 'hexadecimal';

const BASE_RADIX: Record<BaseType, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hexadecimal: 16,
};

function isValidForBase(value: string, base: BaseType): boolean {
  if (!value) return true;
  const radix = BASE_RADIX[base];
  const cleaned = value.replace(/^0+/, '') || '0';
  return cleaned.split('').every((c) => {
    const code = c.toUpperCase().charCodeAt(0);
    if (code >= 48 && code < 48 + Math.min(radix, 10)) return true; // 0-9
    if (radix > 10 && code >= 65 && code < 55 + radix) return true; // A-F
    return false;
  });
}

export default function NumberBaseConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [base, setBase] = useState<BaseType>('decimal');

  const isValid = useMemo(() => isValidForBase(input, base), [input, base]);

  const results = useMemo(() => {
    if (!input || !isValid) return null;
    try {
      const decimal = parseInt(input, BASE_RADIX[base]);
      if (isNaN(decimal)) return null;
      return {
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hexadecimal: decimal.toString(16).toUpperCase(),
      };
    } catch {
      return null;
    }
  }, [input, base, isValid]);

  const baseOptions: { key: BaseType; label: string }[] = [
    { key: 'binary', label: t.bases.binary },
    { key: 'octal', label: t.bases.octal },
    { key: 'decimal', label: t.bases.decimal },
    { key: 'hexadecimal', label: t.bases.hexadecimal },
  ];

  const resultCards: { key: BaseType; label: string; value: string }[] = results
    ? [
        { key: 'binary', label: t.binary, value: results.binary },
        { key: 'octal', label: t.octal, value: results.octal },
        { key: 'decimal', label: t.decimal, value: results.decimal },
        { key: 'hexadecimal', label: t.hexadecimal, value: results.hexadecimal },
      ]
    : [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Binary className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectBase}</Label>
              <div className="flex flex-wrap gap-2">
                {baseOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setBase(opt.key);
                      setInput('');
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                      base === opt.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.enterNumber}</Label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\s/g, ''))}
                placeholder={t.enterNumber}
                className={`tool-input text-base font-mono ${!isValid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {!isValid && (
                <p className="text-sm text-red-500">{t.invalidDigit}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultCards.map((card) => (
            <Card key={card.key} className={card.key === base ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2">{card.label}</div>
                <div className="text-xl font-bold text-primary font-mono break-all select-all">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
