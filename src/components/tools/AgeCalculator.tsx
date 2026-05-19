'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, Gift } from 'lucide-react';

export default function AgeCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [calculated, setCalculated] = useState(false);

  const labels = isRTL
    ? {
        title: 'حاسبة العمر',
        day: 'اليوم',
        month: 'الشهر',
        year: 'السنة',
        calculate: 'احسب العمر',
        reset: 'إعادة تعيين',
        ageResult: 'عمرك',
        years: 'سنوات',
        months: 'أشهر',
        days: 'أيام',
        totalDays: 'إجمالي الأيام',
        totalHours: 'إجمالي الساعات',
        totalWeeks: 'إجمالي الأسابيع',
        nextBirthday: 'عيد الميلاد القادم',
        daysUntil: 'أيام متبقية',
        bornOn: 'تاريخ الميلاد',
        invalidDate: 'تاريخ غير صالح',
        futureDate: 'التاريخ في المستقبل',
      }
    : {
        title: 'Age Calculator',
        day: 'Day',
        month: 'Month',
        year: 'Year',
        calculate: 'Calculate Age',
        reset: 'Reset',
        ageResult: 'Your Age',
        years: 'years',
        months: 'months',
        days: 'days',
        totalDays: 'Total Days',
        totalHours: 'Total Hours',
        totalWeeks: 'Total Weeks',
        nextBirthday: 'Next Birthday',
        daysUntil: 'days until',
        bornOn: 'Date of Birth',
        invalidDate: 'Invalid date',
        futureDate: 'Date is in the future',
      };

  const result = useMemo(() => {
    if (!calculated) return null;
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(d) || isNaN(m) || isNaN(y)) return { error: labels.invalidDate };

    const birthDate = new Date(y, m - 1, d);
    if (birthDate.getDate() !== d || birthDate.getMonth() !== m - 1 || birthDate.getFullYear() !== y) {
      return { error: labels.invalidDate };
    }

    const now = new Date();
    if (birthDate > now) return { error: labels.futureDate };

    // Calculate age
    let ageYears = now.getFullYear() - birthDate.getFullYear();
    let ageMonths = now.getMonth() - birthDate.getMonth();
    let ageDays = now.getDate() - birthDate.getDate();

    if (ageDays < 0) {
      ageMonths--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      ageDays += prevMonth.getDate();
    }
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }

    // Total days
    const diffTime = now.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalWeeks = Math.floor(totalDays / 7);

    // Next birthday
    let nextBirthday = new Date(now.getFullYear(), m - 1, d);
    if (nextBirthday <= now) {
      nextBirthday = new Date(now.getFullYear() + 1, m - 1, d);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ageYears,
      ageMonths,
      ageDays,
      totalDays,
      totalHours,
      totalWeeks,
      daysUntilBirthday,
      birthDateStr: birthDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      nextBirthdayStr: nextBirthday.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [day, month, year, calculated, labels.invalidDate, labels.futureDate, isRTL]);

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleReset = () => {
    setDay('');
    setMonth('');
    setYear('');
    setCalculated(false);
  };

  const months = isRTL
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <CalendarDays className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{labels.day}</Label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={day}
                onChange={(e) => { setDay(e.target.value); setCalculated(false); }}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.month}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={month}
                onChange={(e) => { setMonth(e.target.value); setCalculated(false); }}
              >
                <option value="">{isRTL ? 'اختر الشهر' : 'Select month'}</option>
                {months.map((m, i) => (
                  <option key={i} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{labels.year}</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder={isRTL ? 'مثال: 1990' : 'e.g. 1990'}
                value={year}
                onChange={(e) => { setYear(e.target.value); setCalculated(false); }}
                className="tool-input"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleCalculate} className="tool-action-btn bg-emerald-600 hover:bg-emerald-700 flex-1">
              {labels.calculate}
            </Button>
            <Button onClick={handleReset} variant="outline">
              {labels.reset}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && 'error' in result && result.error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{result.error}</p>
          </CardContent>
        </Card>
      )}

      {result && !('error' in result) && (
        <>
          {/* Age Result */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CalendarDays className="size-5" />
                {labels.ageResult}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-muted-foreground text-sm mb-1">{labels.bornOn}: {result.birthDateStr}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{result.ageYears}</div>
                    <div className="text-sm text-muted-foreground">{labels.years}</div>
                  </div>
                  <span className="text-2xl text-muted-foreground">,</span>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{result.ageMonths}</div>
                    <div className="text-sm text-muted-foreground">{labels.months}</div>
                  </div>
                  <span className="text-2xl text-muted-foreground">,</span>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{result.ageDays}</div>
                    <div className="text-sm text-muted-foreground">{labels.days}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="size-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold text-foreground">
                  {result.totalDays.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </div>
                <p className="text-sm text-muted-foreground">{labels.totalDays}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="size-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold text-foreground">
                  {result.totalHours.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </div>
                <p className="text-sm text-muted-foreground">{labels.totalHours}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="size-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold text-foreground">
                  {result.totalWeeks.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </div>
                <p className="text-sm text-muted-foreground">{labels.totalWeeks}</p>
              </CardContent>
            </Card>
          </div>

          {/* Next Birthday */}
          <Card className="border-violet-200 dark:border-violet-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gift className="size-8 text-violet-600 dark:text-violet-400 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{labels.nextBirthday}</p>
                  <p className="text-sm text-muted-foreground">{result.nextBirthdayStr}</p>
                  <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    {result.daysUntilBirthday} {labels.daysUntil}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
