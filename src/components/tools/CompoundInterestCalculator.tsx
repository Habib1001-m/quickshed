'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';

export default function CompoundInterestCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [frequency, setFrequency] = useState('12'); // monthly

  const labels = isRTL
    ? {
        title: 'حاسبة الفائدة المركبة',
        principal: 'رأس المال',
        rate: 'نسبة الفائدة السنوية',
        years: 'عدد السنوات',
        frequency: 'تكرار الفائدة',
        monthly: 'شهرياً',
        quarterly: 'ربع سنوي',
        annually: 'سنوي',
        finalAmount: 'المبلغ النهائي',
        totalInterest: 'إجمالي الفائدة',
        growthChart: 'جدول النمو',
        year: 'السنة',
        balance: 'الرصيد',
        interest: 'الفائدة المكتسبة',
        currency: 'ر.س',
        enterData: 'أدخل البيانات لحساب الفائدة المركبة',
      }
    : {
        title: 'Compound Interest Calculator',
        principal: 'Principal Amount',
        rate: 'Annual Interest Rate',
        years: 'Number of Years',
        frequency: 'Compounding Frequency',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        annually: 'Annually',
        finalAmount: 'Final Amount',
        totalInterest: 'Total Interest Earned',
        growthChart: 'Growth Chart',
        year: 'Year',
        balance: 'Balance',
        interest: 'Interest Earned',
        currency: '$',
        enterData: 'Enter details to calculate compound interest',
      };

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(years);
    const n = parseInt(frequency);

    if (isNaN(p) || isNaN(r) || isNaN(t) || isNaN(n) || p <= 0 || t <= 0) return null;

    const finalAmount = p * Math.pow(1 + r / 100 / n, n * t);
    const totalInterest = finalAmount - p;

    // Year-by-year growth
    const growthData: { year: number; balance: number; interest: number }[] = [];
    for (let year = 1; year <= Math.min(t, 30); year++) {
      const balance = p * Math.pow(1 + r / 100 / n, n * year);
      growthData.push({
        year,
        balance,
        interest: balance - p,
      });
    }

    return { finalAmount, totalInterest, growthData };
  }, [principal, rate, years, frequency]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const maxBalance = result ? Math.max(...result.growthData.map((d) => d.balance)) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <TrendingUp className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.principal}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={isRTL ? '10000' : '10,000'}
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.rate} (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="7"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.years}</Label>
              <Input
                type="number"
                min="1"
                max="30"
                placeholder="10"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.frequency}</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{labels.annually}</SelectItem>
                  <SelectItem value="4">{labels.quarterly}</SelectItem>
                  <SelectItem value="12">{labels.monthly}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{labels.finalAmount}</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {labels.currency} {fmt(result.finalAmount)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-sky-200 dark:border-sky-800">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{labels.totalInterest}</p>
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {labels.currency} {fmt(result.totalInterest)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart - Bar representation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.growthChart}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.growthData.map((data) => (
                  <div key={data.year} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">
                      {labels.year} {data.year}
                    </span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-l from-emerald-500 to-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${(data.balance / maxBalance) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-24 text-end shrink-0">
                      {labels.currency}{fmt(data.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{labels.enterData}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
