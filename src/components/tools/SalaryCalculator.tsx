'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wallet } from 'lucide-react';

export default function SalaryCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [salaryAmount, setSalaryAmount] = useState('');
  const [isHourly, setIsHourly] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');

  const labels = isRTL
    ? {
        title: 'حاسبة الراتب',
        annualSalary: 'الراتب السنوي',
        hourlyRate: 'الأجر بالساعة',
        taxRate: 'نسبة الضريبة',
        hoursPerWeek: 'ساعات العمل أسبوعياً',
        breakdown: 'تفاصيل الراتب',
        gross: 'إجمالي',
        net: 'صافي',
        annual: 'سنوي',
        monthly: 'شهري',
        biWeekly: 'نصف شهري',
        weekly: 'أسبوعي',
        daily: 'يومي',
        hourly: 'بالساعة',
        taxAmount: 'مبلغ الضريبة',
        currency: 'ر.س',
        enterData: 'أدخل الراتب لحساب التفاصيل',
        hoursLabel: 'ساعة',
      }
    : {
        title: 'Salary Calculator',
        annualSalary: 'Annual Salary',
        hourlyRate: 'Hourly Rate',
        taxRate: 'Tax Rate',
        hoursPerWeek: 'Hours per Week',
        breakdown: 'Salary Breakdown',
        gross: 'Gross',
        net: 'Net',
        annual: 'Annual',
        monthly: 'Monthly',
        biWeekly: 'Bi-weekly',
        weekly: 'Weekly',
        daily: 'Daily',
        hourly: 'Hourly',
        taxAmount: 'Tax Amount',
        currency: '$',
        enterData: 'Enter salary to calculate breakdown',
        hoursLabel: 'hours',
      };

  const result = useMemo(() => {
    const amount = parseFloat(salaryAmount);
    const tax = parseFloat(taxRate) || 0;
    const hrsPerWeek = parseFloat(hoursPerWeek) || 40;

    if (isNaN(amount) || amount <= 0) return null;

    let annualGross: number;
    let hourlyGross: number;

    if (isHourly) {
      hourlyGross = amount;
      annualGross = amount * hrsPerWeek * 52;
    } else {
      annualGross = amount;
      hourlyGross = amount / (hrsPerWeek * 52);
    }

    const monthlyGross = annualGross / 12;
    const biWeeklyGross = annualGross / 26;
    const weeklyGross = annualGross / 52;
    const dailyGross = weeklyGross / 5;

    const taxMultiplier = 1 - tax / 100;

    return {
      gross: {
        annual: annualGross,
        monthly: monthlyGross,
        biWeekly: biWeeklyGross,
        weekly: weeklyGross,
        daily: dailyGross,
        hourly: hourlyGross,
      },
      net: {
        annual: annualGross * taxMultiplier,
        monthly: monthlyGross * taxMultiplier,
        biWeekly: biWeeklyGross * taxMultiplier,
        weekly: weeklyGross * taxMultiplier,
        daily: dailyGross * taxMultiplier,
        hourly: hourlyGross * taxMultiplier,
      },
      taxAmount: annualGross * (tax / 100),
    };
  }, [salaryAmount, isHourly, taxRate, hoursPerWeek]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <Wallet className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Salary Type Toggle */}
            <div className="flex items-center gap-3">
              <Label className="text-sm">{labels.annualSalary}</Label>
              <Switch checked={isHourly} onCheckedChange={setIsHourly} />
              <Label className="text-sm">{labels.hourlyRate}</Label>
            </div>

            <div className="space-y-2">
              <Label>{isHourly ? labels.hourlyRate : labels.annualSalary}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={isHourly ? '25.00' : '50,000'}
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                className="tool-input"
              />
            </div>

            <div className="space-y-2">
              <Label>{labels.taxRate} (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder={isRTL ? '15' : '15'}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="tool-input"
              />
            </div>

            {isHourly && (
              <div className="space-y-2">
                <Label>{labels.hoursPerWeek}</Label>
                <Input
                  type="number"
                  min="1"
                  max="80"
                  placeholder="40"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="tool-input"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          {/* Tax Summary */}
          {parseFloat(taxRate) > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{labels.taxAmount} ({taxRate}%)</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {labels.currency} {fmt(result.taxAmount)} / {labels.annual}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breakdown Table */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.breakdown}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-3 px-3 text-start"></th>
                      <th className="py-3 px-3 text-end">{labels.gross}</th>
                      <th className="py-3 px-3 text-end">{labels.net}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: labels.annual, gross: result.gross.annual, net: result.net.annual },
                      { label: labels.monthly, gross: result.gross.monthly, net: result.net.monthly },
                      { label: labels.biWeekly, gross: result.gross.biWeekly, net: result.net.biWeekly },
                      { label: labels.weekly, gross: result.gross.weekly, net: result.net.weekly },
                      { label: labels.daily, gross: result.gross.daily, net: result.net.daily },
                      { label: labels.hourly, gross: result.gross.hourly, net: result.net.hourly },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-3 font-medium">{row.label}</td>
                        <td className="py-3 px-3 text-end font-mono">{labels.currency} {fmt(row.gross)}</td>
                        <td className="py-3 px-3 text-end font-mono text-emerald-600 dark:text-emerald-400">
                          {labels.currency} {fmt(row.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
