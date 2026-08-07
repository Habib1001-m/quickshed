'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ArrowDownAZ, ArrowUpZA, SortAsc, Shuffle, Trash2, ListOrdered } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'Line Sorter',
    inputLabel: 'Input (one item per line)',
    inputPlaceholder: 'Enter items, one per line...',
    outputLabel: 'Sorted Result',
    sortAZ: 'A → Z',
    sortZA: 'Z → A',
    reverse: 'Reverse',
    shuffle: 'Shuffle',
    removeEmpty: 'Remove Empty',
    removeDuplicates: 'Remove Duplicates',
    copy: 'Copy',
    copied: 'Copied!',
    lineCount: 'lines',
  },
  ar: {
    title: 'فرز الأسطر',
    inputLabel: 'المدخل (عنصر في كل سطر)',
    inputPlaceholder: 'أدخل العناصر، عنصر في كل سطر...',
    outputLabel: 'النتيجة المرتبة',
    sortAZ: 'أ → ي',
    sortZA: 'ي → أ',
    reverse: 'عكس',
    shuffle: 'خلط',
    removeEmpty: 'إزالة الفارغة',
    removeDuplicates: 'إزالة المكررة',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    lineCount: 'سطور',
  },
};

export default function LineSorter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => input.split('\n'), [input]);

  const applySortAZ = () => {
    setInput([...lines].sort((a, b) => a.localeCompare(b, locale === 'ar' ? 'ar' : 'en')).join('\n'));
  };

  const applySortZA = () => {
    setInput([...lines].sort((a, b) => b.localeCompare(a, locale === 'ar' ? 'ar' : 'en')).join('\n'));
  };

  const applyReverse = () => {
    setInput([...lines].reverse().join('\n'));
  };

  const applyShuffle = () => {
    const arr = [...lines];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setInput(arr.join('\n'));
  };

  const applyRemoveEmpty = () => {
    setInput(lines.filter((l) => l.trim() !== '').join('\n'));
  };

  const applyRemoveDuplicates = () => {
    const seen = new Set<string>();
    setInput(lines.filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    }).join('\n'));
  };

  const handleCopy = async () => {
    setCopied(false);
    if (await copyTextToClipboard(input)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };

  const nonEmptyCount = lines.filter((l) => l.trim() !== '').length;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ListOrdered className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={applySortAZ} variant="outline" size="sm" className="gap-1.5">
              <ArrowDownAZ className="size-3.5" />
              {t.sortAZ}
            </Button>
            <Button onClick={applySortZA} variant="outline" size="sm" className="gap-1.5">
              <ArrowUpZA className="size-3.5" />
              {t.sortZA}
            </Button>
            <Button onClick={applyReverse} variant="outline" size="sm" className="gap-1.5">
              <SortAsc className="size-3.5" />
              {t.reverse}
            </Button>
            <Button onClick={applyShuffle} variant="outline" size="sm" className="gap-1.5">
              <Shuffle className="size-3.5" />
              {t.shuffle}
            </Button>
            <Button onClick={applyRemoveEmpty} variant="outline" size="sm" className="gap-1.5">
              <Trash2 className="size-3.5" />
              {t.removeEmpty}
            </Button>
            <Button onClick={applyRemoveDuplicates} variant="outline" size="sm" className="gap-1.5">
              <Copy className="size-3.5" />
              {t.removeDuplicates}
            </Button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.inputLabel}</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="tool-input min-h-[200px] resize-y font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Output & stats */}
      {input.trim() && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {t.outputLabel}{' '}
              <span className="text-muted-foreground text-sm font-normal">({nonEmptyCount} {t.lineCount})</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              readOnly
              className="tool-output min-h-[200px] resize-y font-mono text-sm bg-muted/50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
