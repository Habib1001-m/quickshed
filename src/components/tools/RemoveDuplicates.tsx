'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Check, ListFilter } from 'lucide-react';

const labels = {
  en: {
    title: 'Remove Duplicates',
    inputPlaceholder: 'Enter one item per line...',
    outputPlaceholder: 'Unique lines will appear here...',
    caseSensitive: 'Case-sensitive',
    trimWhitespace: 'Trim whitespace',
    originalCount: 'Original lines',
    uniqueCount: 'Unique lines',
    duplicatesRemoved: 'Duplicates removed',
    copied: 'Copied!',
    copy: 'Copy',
  },
  ar: {
    title: 'إزالة المكررات',
    inputPlaceholder: 'أدخل عنصراً واحداً في كل سطر...',
    outputPlaceholder: 'ستظهر الأسطر الفريدة هنا...',
    caseSensitive: 'حساس لحالة الأحرف',
    trimWhitespace: 'إزالة المسافات الزائدة',
    originalCount: 'الأسطر الأصلية',
    uniqueCount: 'الأسطر الفريدة',
    duplicatesRemoved: 'المكررات المحذوفة',
    copied: 'تم النسخ!',
    copy: 'نسخ',
  },
};

export default function RemoveDuplicates({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return { output: '', original: 0, unique: 0, removed: 0 };

    const lines = text.split('\n');
    const original = lines.length;

    const processLine = (line: string) => {
      let l = line;
      if (trimWhitespace) l = l.trim();
      if (!caseSensitive) l = l.toLowerCase();
      return l;
    };

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const key = processLine(line);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(trimWhitespace ? line.trim() : line);
      }
    }

    const unique = uniqueLines.length;
    return {
      output: uniqueLines.join('\n'),
      original,
      unique,
      removed: original - unique,
    };
  }, [text, caseSensitive, trimWhitespace]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ListFilter className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[200px] resize-y text-base"
          />
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={setCaseSensitive}
              />
              <Label htmlFor="case-sensitive">{t.caseSensitive}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="trim-whitespace"
                checked={trimWhitespace}
                onCheckedChange={setTrimWhitespace}
              />
              <Label htmlFor="trim-whitespace">{t.trimWhitespace}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{result.original}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.originalCount}</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{result.unique}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.uniqueCount}</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600">{result.removed}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.duplicatesRemoved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t.uniqueCount}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!result.output}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result.output}
            readOnly
            placeholder={t.outputPlaceholder}
            className="tool-output min-h-[200px] resize-y text-base bg-muted/50"
          />
        </CardContent>
      </Card>
    </div>
  );
}
