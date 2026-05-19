'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarPlus, Plus, Minus } from 'lucide-react';

export default function DateAdder({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [weeks, setWeeks] = useState(0);
  const [days, setDays] = useState(0);
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  const calcResult = () => {
    if (!startDate) return null;
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return null;

    const sign = mode === 'add' ? 1 : -1;
    date.setFullYear(date.getFullYear() + sign * years);
    date.setMonth(date.getMonth() + sign * months);
    date.setDate(date.getDate() + sign * weeks * 7 + sign * days);

    return date;
  };

  const result = calcResult();

  const quickButtons = [
    { label: isAr ? '+7 أيام' : '+7 days', y: 0, m: 0, w: 1, d: 0 },
    { label: isAr ? '+30 يوم' : '+30 days', y: 0, m: 1, w: 0, d: 0 },
    { label: isAr ? '+90 يوم' : '+90 days', y: 0, m: 3, w: 0, d: 0 },
    { label: isAr ? '+1 سنة' : '+1 year', y: 1, m: 0, w: 0, d: 0 },
  ];

  const applyQuick = (q: { y: number; m: number; w: number; d: number }) => {
    setYears(q.y);
    setMonths(q.m);
    setWeeks(q.w);
    setDays(q.d);
    setMode('add');
  };

  const formatResult = (date: Date) => {
    return date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <CalendarPlus className="size-5" />
          {isAr ? 'إضافة تاريخ' : 'Date Adder'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Start date */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>{isAr ? 'تاريخ البداية' : 'Start Date'}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="tool-input font-mono"
              />
            </div>

            {/* Add/Subtract toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'add' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('add')}
                className={mode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <Plus className="size-4 me-1" />
                {isAr ? 'إضافة' : 'Add'}
              </Button>
              <Button
                variant={mode === 'subtract' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('subtract')}
                className={mode === 'subtract' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                <Minus className="size-4 me-1" />
                {isAr ? 'طرح' : 'Subtract'}
              </Button>
            </div>

            {/* Duration inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'سنوات' : 'Years'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={years}
                  onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="tool-input text-center font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'أشهر' : 'Months'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={months}
                  onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="tool-input text-center font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'أسابيع' : 'Weeks'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={weeks}
                  onChange={(e) => setWeeks(Math.max(0, parseInt(e.target.value) || 0))}
                  className="tool-input text-center font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'أيام' : 'Days'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={days}
                  onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="tool-input text-center font-mono"
                />
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-2">
              {quickButtons.map((q) => (
                <Button key={q.label} variant="outline" size="sm" onClick={() => applyQuick(q)}>
                  {q.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {isAr ? 'التاريخ الناتج' : 'Resulting Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatResult(result)}</div>
              <div className="text-sm text-muted-foreground mt-1 font-mono">
                {result.toISOString().split('T')[0]}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
