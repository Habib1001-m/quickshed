'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gauge } from 'lucide-react';

const labels = {
  en: {
    title: 'Speed Converter',
    enterSpeed: 'Enter speed',
    selectUnit: 'Select unit',
    results: 'Conversion Results',
  },
  ar: {
    title: 'محول السرعة',
    enterSpeed: 'أدخل السرعة',
    selectUnit: 'اختر الوحدة',
    results: 'نتائج التحويل',
  },
};

type SpeedUnit = 'ms' | 'kmh' | 'mph' | 'knot' | 'fts' | 'mach';

interface SpeedDef {
  value: SpeedUnit;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const SPEED_UNITS: SpeedDef[] = [
  { value: 'ms', label: 'm/s', toBase: (v) => v, fromBase: (v) => v },
  { value: 'kmh', label: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  { value: 'mph', label: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  { value: 'knot', label: 'Knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  { value: 'fts', label: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { value: 'mach', label: 'Mach', toBase: (v) => v * 343, fromBase: (v) => v / 343 },
];

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  if (Math.abs(n) < 0.01) return n.toExponential(4);
  return n.toFixed(6).replace(/\.?0+$/, '');
}

export default function SpeedConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<SpeedUnit>('kmh');

  const results = useMemo(() => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return null;
    const fromDef = SPEED_UNITS.find((u) => u.value === unit);
    if (!fromDef) return null;
    const baseMs = fromDef.toBase(numVal);
    return SPEED_UNITS.map((u) => ({
      unit: u.value,
      label: u.label,
      value: u.fromBase(baseMs),
    }));
  }, [value, unit]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Gauge className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectUnit}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as SpeedUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.enterSpeed}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.enterSpeed}
                className="tool-input text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.results}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((r) => (
                <div
                  key={r.unit}
                  className={`rounded-lg border p-4 text-center transition-colors ${
                    r.unit === unit ? 'bg-primary/10 border-primary' : 'bg-muted/30'
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
                  <div className="text-xl font-bold text-primary">{formatNum(r.value)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
