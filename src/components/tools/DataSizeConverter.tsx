'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardDrive } from 'lucide-react';

const labels = {
  en: {
    title: 'Data Size Converter',
    enterSize: 'Enter size',
    selectUnit: 'Select unit',
    results: 'All Conversions',
    visual: 'Size Comparison',
  },
  ar: {
    title: 'محول حجم البيانات',
    enterSize: 'أدخل الحجم',
    selectUnit: 'اختر الوحدة',
    results: 'جميع التحويلات',
    visual: 'مقارنة الأحجام',
  },
};

type DataUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

interface DataUnitDef {
  value: DataUnit;
  label: string;
  toBase: number; // multiplier to bytes
}

const DATA_UNITS: DataUnitDef[] = [
  { value: 'B', label: 'Bytes (B)', toBase: 1 },
  { value: 'KB', label: 'Kilobytes (KB)', toBase: 1024 },
  { value: 'MB', label: 'Megabytes (MB)', toBase: 1024 ** 2 },
  { value: 'GB', label: 'Gigabytes (GB)', toBase: 1024 ** 3 },
  { value: 'TB', label: 'Terabytes (TB)', toBase: 1024 ** 4 },
  { value: 'PB', label: 'Petabytes (PB)', toBase: 1024 ** 5 },
];

function formatDataSize(bytes: number, unitMultiplier: number): string {
  const val = bytes / unitMultiplier;
  if (val === 0) return '0';
  if (Number.isInteger(val)) return val.toLocaleString();
  if (Math.abs(val) >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Math.abs(val) >= 1) return val.toFixed(4).replace(/\.?0+$/, '');
  return val.toExponential(4);
}

export default function DataSizeConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<DataUnit>('MB');

  const results = useMemo(() => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) return null;
    const fromDef = DATA_UNITS.find((u) => u.value === unit);
    if (!fromDef) return null;
    const bytes = numVal * fromDef.toBase;
    return DATA_UNITS.map((u) => ({
      unit: u.value,
      label: u.label,
      value: bytes / u.toBase,
      formatted: formatDataSize(bytes, u.toBase),
    }));
  }, [value, unit]);

  // Visual comparison: find the largest unit where value >= 1
  const visualUnit = useMemo(() => {
    if (!results) return null;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].value >= 1) return results[i];
    }
    return results[0];
  }, [results]);

  // Bar widths for visual comparison
  const maxLogValue = useMemo(() => {
    if (!results) return 1;
    const max = Math.max(...results.filter(r => r.value > 0).map(r => Math.log10(r.value)));
    return max || 1;
  }, [results]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <HardDrive className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectUnit}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as DataUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.enterSize}</Label>
              <Input
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.enterSize}
                className="tool-input text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.results}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((r) => (
                  <div
                    key={r.unit}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      r.unit === unit ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{r.label}</span>
                    <span className="text-base font-bold text-primary font-mono">{r.formatted}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {visualUnit && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.visual}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.filter(r => r.value > 0).map((r) => {
                    const width = maxLogValue > 0
                      ? Math.max(4, (Math.log10(r.value) / maxLogValue) * 100)
                      : 50;
                    return (
                      <div key={r.unit} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-10 text-right">{r.unit}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/70 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, width)}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-muted-foreground min-w-[80px]">{r.formatted}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
