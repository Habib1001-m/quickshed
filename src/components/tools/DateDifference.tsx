'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

export default function DateDifference({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const calc = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalWeeks = Math.floor(totalDays / 7);

    // Calculate years, months, days
    let years = 0;
    let months = 0;
    let days = 0;

    const earlier = start < end ? new Date(start) : new Date(end);
    const later = start < end ? new Date(end) : new Date(start);

    years = later.getFullYear() - earlier.getFullYear();
    months = later.getMonth() - earlier.getMonth();
    days = later.getDate() - earlier.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days, totalDays, totalHours, totalMinutes, totalWeeks };
  };

  const result = calc();

  const stats = result
    ? [
        { label: isAr ? 'سنوات' : 'Years', value: result.years },
        { label: isAr ? 'أشهر' : 'Months', value: result.months },
        { label: isAr ? 'أيام' : 'Days', value: result.days },
        { label: isAr ? 'إجمالي الأيام' : 'Total Days', value: result.totalDays },
        { label: isAr ? 'إجمالي الساعات' : 'Total Hours', value: result.totalHours.toLocaleString() },
        { label: isAr ? 'إجمالي الدقائق' : 'Total Minutes', value: result.totalMinutes.toLocaleString() },
        { label: isAr ? 'إجمالي الأسابيع' : 'Total Weeks', value: result.totalWeeks },
      ]
    : [];

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <CalendarDays className="size-5" />
          {isAr ? 'فرق التاريخ' : 'Date Difference'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{isAr ? 'تاريخ البداية' : 'Start Date'}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="tool-input font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'تاريخ النهاية' : 'End Date'}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="tool-input font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {isAr ? 'الفرق بين التاريخين' : 'Difference'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tool-output grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border bg-muted/30 p-3 text-center"
                >
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </CardContent>
    </Card>
  );
}
