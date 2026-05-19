'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Thermometer } from 'lucide-react';

const labels = {
  en: {
    title: 'Temperature Converter',
    celsius: 'Celsius (°C)',
    fahrenheit: 'Fahrenheit (°F)',
    kelvin: 'Kelvin (K)',
    enterTemperature: 'Enter temperature',
    selectUnit: 'Select unit',
    freezing: 'Freezing',
    cold: 'Cold',
    cool: 'Cool',
    comfortable: 'Comfortable',
    warm: 'Warm',
    hot: 'Hot',
    veryHot: 'Very Hot',
  },
  ar: {
    title: 'محول درجة الحرارة',
    celsius: 'مئوية (°C)',
    fahrenheit: 'فهرنهايت (°F)',
    kelvin: 'كلفن (K)',
    enterTemperature: 'أدخل درجة الحرارة',
    selectUnit: 'اختر الوحدة',
    freezing: 'متجمد',
    cold: 'بارد',
    cool: 'دافئ قليلاً',
    comfortable: 'مريح',
    warm: 'دافئ',
    hot: 'حار',
    veryHot: 'حار جداً',
  },
};

type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin';

function convertTemperature(value: number, from: TempUnit): Record<TempUnit, number> {
  let celsius: number;
  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
  }
  return {
    celsius,
    fahrenheit: celsius * 9 / 5 + 32,
    kelvin: celsius + 273.15,
  };
}

function formatTemp(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function getTempFeeling(celsius: number, t: typeof labels.en): string {
  if (celsius <= 0) return t.freezing;
  if (celsius <= 10) return t.cold;
  if (celsius <= 18) return t.cool;
  if (celsius <= 26) return t.comfortable;
  if (celsius <= 35) return t.warm;
  if (celsius <= 45) return t.hot;
  return t.veryHot;
}

export default function TemperatureConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<TempUnit>('celsius');

  const results = useMemo(() => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return null;
    return convertTemperature(numVal, unit);
  }, [value, unit]);

  const thermometerPercent = useMemo(() => {
    if (!results) return 0;
    // Map -40 to 50 celsius → 0% to 100%
    const c = results.celsius;
    return Math.max(0, Math.min(100, ((c + 40) / 90) * 100));
  }, [results]);

  const tempColor = useMemo(() => {
    if (!results) return 'bg-blue-400';
    const c = results.celsius;
    if (c <= 0) return 'bg-blue-500';
    if (c <= 10) return 'bg-sky-500';
    if (c <= 18) return 'bg-teal-500';
    if (c <= 26) return 'bg-emerald-500';
    if (c <= 35) return 'bg-amber-500';
    if (c <= 45) return 'bg-orange-500';
    return 'bg-red-500';
  }, [results]);

  const unitLabels: Record<TempUnit, string> = {
    celsius: t.celsius,
    fahrenheit: t.fahrenheit,
    kelvin: t.kelvin,
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Thermometer className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectUnit}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as TempUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">{t.celsius}</SelectItem>
                  <SelectItem value="fahrenheit">{t.fahrenheit}</SelectItem>
                  <SelectItem value="kelvin">{t.kelvin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.enterTemperature}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.enterTemperature}
                className="tool-input text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['celsius', 'fahrenheit', 'kelvin'] as TempUnit[]).map((u) => (
              <Card key={u} className={unit === u ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">{unitLabels[u]}</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatTemp(results[u])}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {u === 'celsius' ? '°C' : u === 'fahrenheit' ? '°F' : 'K'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Visual thermometer */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm font-medium text-muted-foreground">{getTempFeeling(results.celsius, t)}</div>
                  <div className="relative w-12 h-48 rounded-full border-2 border-muted overflow-hidden bg-muted/30">
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ${tempColor}`}
                      style={{ height: `${thermometerPercent}%` }}
                    />
                  </div>
                  <div className="text-sm font-mono">
                    {formatTemp(results.celsius)}°C
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>-40°C</span>
                    <span>{t.freezing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0°C</span>
                    <span>{t.cold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20°C</span>
                    <span>{t.comfortable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>37°C</span>
                    <span>{t.hot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50°C</span>
                    <span>{t.veryHot}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
