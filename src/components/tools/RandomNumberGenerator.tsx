'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, Dices, ArrowUpDown } from 'lucide-react';

const labels = {
  en: {
    title: 'Random Number Generator',
    min: 'Minimum',
    max: 'Maximum',
    count: 'How many',
    allowDuplicates: 'Allow duplicates',
    integerOnly: 'Integer only',
    sortResults: 'Sort results',
    generate: 'Generate',
    copy: 'Copy',
    copied: 'Copied!',
    results: 'Results',
    invalidRange: 'Min must be less than max',
    tooManyUnique: 'Cannot generate that many unique numbers in this range',
  },
  ar: {
    title: 'مولّد الأرقام العشوائية',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    count: 'العدد',
    allowDuplicates: 'السماح بالتكرار',
    integerOnly: 'أرقام صحيحة فقط',
    sortResults: 'ترتيب النتائج',
    generate: 'توليد',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    results: 'النتائج',
    invalidRange: 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى',
    tooManyUnique: 'لا يمكن توليد هذا العدد من الأرقام الفريدة في هذا النطاق',
  },
};

export default function RandomNumberGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [integerOnly, setIntegerOnly] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isValid = min < max;

  const handleGenerate = () => {
    if (!isValid) { setError(t.invalidRange); return; }

    const rangeSize = integerOnly ? (max - min + 1) : Infinity;
    if (!allowDuplicates && count > rangeSize) {
      setError(t.tooManyUnique);
      return;
    }
    setError('');

    const nums: number[] = [];
    if (allowDuplicates) {
      for (let i = 0; i < count; i++) {
        const raw = Math.random() * (max - min) + min;
        nums.push(integerOnly ? Math.floor(raw) + (raw === Math.floor(raw) && min <= Math.floor(raw) ? 0 : 0) : raw);
        if (integerOnly) nums[i] = Math.floor(Math.random() * (max - min + 1)) + min;
        else nums[i] = parseFloat((Math.random() * (max - min) + min).toFixed(4));
      }
    } else {
      if (integerOnly) {
        const pool: number[] = [];
        for (let i = min; i <= max; i++) pool.push(i);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        for (let i = 0; i < count; i++) nums.push(pool[i]);
      } else {
        const seen = new Set<string>();
        while (nums.length < count) {
          const val = parseFloat((Math.random() * (max - min) + min).toFixed(4));
          const key = val.toString();
          if (!seen.has(key)) {
            seen.add(key);
            nums.push(val);
          }
        }
      }
    }

    if (sortResults) nums.sort((a, b) => a - b);
    setResults(nums);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Dices className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{t.min}</Label>
              <Input
                type="number"
                value={min}
                onChange={(e) => setMin(parseFloat(e.target.value) || 0)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.max}</Label>
              <Input
                type="number"
                value={max}
                onChange={(e) => setMax(parseFloat(e.target.value) || 0)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.count}</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="tool-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="rng-dup">{t.allowDuplicates}</Label>
              <Switch id="rng-dup" checked={allowDuplicates} onCheckedChange={setAllowDuplicates} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="rng-int">{t.integerOnly}</Label>
              <Switch id="rng-int" checked={integerOnly} onCheckedChange={setIntegerOnly} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="rng-sort">{t.sortResults}</Label>
              <Switch id="rng-sort" checked={sortResults} onCheckedChange={setSortResults} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleGenerate} disabled={!isValid} className="tool-action-btn gap-2">
            <Dices className="size-4" />
            {t.generate}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpDown className="size-4" />
              {t.results}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="tool-output flex flex-wrap gap-2">
              {results.map((n, i) => (
                <span key={i} className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-mono font-semibold text-primary">
                  {n}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
