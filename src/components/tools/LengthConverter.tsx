'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ruler } from 'lucide-react';

const labels = {
  en: {
    title: 'Length Converter',
    enterLength: 'Enter length',
    selectUnit: 'Select unit',
    conversions: 'Common Conversions',
  },
  ar: {
    title: 'محول الطول',
    enterLength: 'أدخل الطول',
    selectUnit: 'اختر الوحدة',
    conversions: 'التحويلات الشائعة',
  },
};

type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'inch' | 'foot' | 'yard' | 'mile';

interface LengthDef {
  value: LengthUnit;
  label: string;
  toMeters: number;
}

const LENGTH_UNITS: LengthDef[] = [
  { value: 'mm', label: 'Millimeter (mm)', toMeters: 0.001 },
  { value: 'cm', label: 'Centimeter (cm)', toMeters: 0.01 },
  { value: 'm', label: 'Meter (m)', toMeters: 1 },
  { value: 'km', label: 'Kilometer (km)', toMeters: 1000 },
  { value: 'inch', label: 'Inch (in)', toMeters: 0.0254 },
  { value: 'foot', label: 'Foot (ft)', toMeters: 0.3048 },
  { value: 'yard', label: 'Yard (yd)', toMeters: 0.9144 },
  { value: 'mile', label: 'Mile (mi)', toMeters: 1609.344 },
];

function formatLength(val: number): string {
  if (val === 0) return '0';
  if (Number.isInteger(val)) return val.toLocaleString();
  if (Math.abs(val) >= 100) return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (Math.abs(val) >= 0.01) return val.toFixed(6).replace(/\.?0+$/, '');
  return val.toExponential(4);
}

export default function LengthConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<LengthUnit>('m');

  const results = useMemo(() => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return null;
    const fromDef = LENGTH_UNITS.find((u) => u.value === unit);
    if (!fromDef) return null;
    const meters = numVal * fromDef.toMeters;
    return LENGTH_UNITS.map((u) => ({
      unit: u.value,
      label: u.label,
      value: meters / u.toMeters,
      formatted: formatLength(meters / u.toMeters),
    }));
  }, [value, unit]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Ruler className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectUnit}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as LengthUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.enterLength}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.enterLength}
                className="tool-input text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.conversions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {results.map((r) => (
                <div
                  key={r.unit}
                  className={`rounded-lg border p-4 text-center transition-colors ${
                    r.unit === unit ? 'bg-primary/10 border-primary' : ''
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
                  <div className="text-lg font-bold text-primary font-mono select-all">
                    {r.formatted}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
