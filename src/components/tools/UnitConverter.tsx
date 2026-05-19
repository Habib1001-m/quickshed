'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';

const labels = {
  en: {
    title: 'Unit Converter',
    category: 'Category',
    from: 'From',
    to: 'To',
    value: 'Value',
    result: 'Result',
    swap: 'Swap',
    length: 'Length',
    weight: 'Weight',
    temperature: 'Temperature',
    area: 'Area',
    volume: 'Volume',
    speed: 'Speed',
  },
  ar: {
    title: 'محول الوحدات',
    category: 'الفئة',
    from: 'من',
    to: 'إلى',
    value: 'القيمة',
    result: 'النتيجة',
    swap: 'تبديل',
    length: 'الطول',
    weight: 'الوزن',
    temperature: 'الحرارة',
    area: 'المساحة',
    volume: 'الحجم',
    speed: 'السرعة',
  },
};

type Category = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed';

interface UnitDef {
  value: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { value: 'mm', label: 'Millimeter (mm)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'cm', label: 'Centimeter (cm)', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { value: 'm', label: 'Meter (m)', toBase: (v) => v, fromBase: (v) => v },
    { value: 'km', label: 'Kilometer (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { value: 'inch', label: 'Inch (in)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { value: 'foot', label: 'Foot (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { value: 'yard', label: 'Yard (yd)', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { value: 'mile', label: 'Mile (mi)', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  weight: [
    { value: 'mg', label: 'Milligram (mg)', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { value: 'g', label: 'Gram (g)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'kg', label: 'Kilogram (kg)', toBase: (v) => v, fromBase: (v) => v },
    { value: 'ton', label: 'Metric Ton (t)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { value: 'oz', label: 'Ounce (oz)', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { value: 'lb', label: 'Pound (lb)', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  ],
  temperature: [
    { value: 'c', label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
    { value: 'f', label: 'Fahrenheit (°F)', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { value: 'k', label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  area: [
    { value: 'mm2', label: 'mm²', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { value: 'cm2', label: 'cm²', toBase: (v) => v / 1e4, fromBase: (v) => v * 1e4 },
    { value: 'm2', label: 'm²', toBase: (v) => v, fromBase: (v) => v },
    { value: 'km2', label: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { value: 'acre', label: 'Acre', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
    { value: 'hectare', label: 'Hectare', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    { value: 'ft2', label: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
  ],
  volume: [
    { value: 'ml', label: 'Milliliter (ml)', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { value: 'l', label: 'Liter (L)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'm3', label: 'm³', toBase: (v) => v, fromBase: (v) => v },
    { value: 'gallon', label: 'US Gallon', toBase: (v) => v * 0.00378541, fromBase: (v) => v / 0.00378541 },
    { value: 'quart', label: 'US Quart', toBase: (v) => v * 0.000946353, fromBase: (v) => v / 0.000946353 },
    { value: 'cup', label: 'US Cup', toBase: (v) => v * 0.000236588, fromBase: (v) => v / 0.000236588 },
    { value: 'floz', label: 'US Fl Oz', toBase: (v) => v * 2.9574e-5, fromBase: (v) => v / 2.9574e-5 },
  ],
  speed: [
    { value: 'ms', label: 'm/s', toBase: (v) => v, fromBase: (v) => v },
    { value: 'kmh', label: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { value: 'mph', label: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { value: 'knot', label: 'Knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { value: 'fts', label: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
};

export default function UnitConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [value, setValue] = useState('');

  const units = UNITS[category];

  const result = useMemo(() => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return '';
    const fromDef = units.find((u) => u.value === fromUnit);
    const toDef = units.find((u) => u.value === toUnit);
    if (!fromDef || !toDef) return '';
    const base = fromDef.toBase(numVal);
    const converted = toDef.fromBase(base);
    return Number.isInteger(converted) ? converted.toString() : converted.toPrecision(10).replace(/\.?0+$/, '');
  }, [value, fromUnit, toUnit, units]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromUnit(UNITS[cat][0].value);
    setToUnit(UNITS[cat][1].value);
    setValue('');
  };

  const categoryLabels: Record<Category, string> = {
    length: t.length,
    weight: t.weight,
    temperature: t.temperature,
    area: t.area,
    volume: t.volume,
    speed: t.speed,
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ArrowLeftRight className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.category}</Label>
            <Select value={category} onValueChange={(v) => handleCategoryChange(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(UNITS) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label>{t.from}</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.value}
                className="tool-input text-base"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSwap} className="self-end mb-0.5">
              <ArrowUpDown className="size-4" />
            </Button>
            <div className="space-y-2">
              <Label>{t.to}</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="tool-output rounded-md border bg-muted/50 p-3 text-xl font-bold text-primary min-h-[44px]">
                {result || '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
