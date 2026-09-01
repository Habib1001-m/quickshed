'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Banknote } from 'lucide-react';

export default function LoanCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [isYears, setIsYears] = useState(true);

  const labels = isRTL
    ? {
        title: 'حاسبة القروض',
        loanAmount: 'مبلغ القرض',
        interestRate: 'نسبة الفائدة السنوية',
        loanTerm: 'مدة القرض',
        years: 'سنوات',
        months: 'أشهر',
        monthlyPayment: 'القسط الشهري',
        totalPayment: 'إجمالي السداد',
        totalInterest: 'إجمالي الفائدة',
        amortizationSchedule: 'جدول السداد',
        month: 'الشهر',
        payment: 'القسط',
        principal: 'أصل القرض',
        interest: 'الفائدة',
        balance: 'الرصيد المتبقي',
        currency: 'ر.س',
        enterData: 'أدخل بيانات القرض لحساب الأقساط',
        showSchedule: 'جدول السداد (12 شهراً)',
      }
    : {
        title: 'Loan Calculator',
        loanAmount: 'Loan Amount',
        interestRate: 'Annual Interest Rate',
        loanTerm: 'Loan Term',
        years: 'Years',
        months: 'Months',
        monthlyPayment: 'Monthly Payment',
        totalPayment: 'Total Payment',
        totalInterest: 'Total Interest',
        amortizationSchedule: 'Amortization Schedule',
        month: 'Month',
        payment: 'Payment',
        principal: 'Principal',
        interest: 'Interest',
        balance: 'Balance',
        currency: '$',
        enterData: 'Enter loan details to calculate payments',
        showSchedule: 'Amortization Schedule (12 months)',
      };

  const result = useMemo(() => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(term) || principal <= 0 || term <= 0) return null;

    const totalMonths = isYears ? term * 12 : term;
    if (totalMonths <= 0) return null;

    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / totalMonths;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    // Amortization schedule (first 12 months)
    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let balance = principal;
    const monthsToShow = Math.min(12, totalMonths);

    for (let i = 1; i <= monthsToShow; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(balance, 0),
      });
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
      totalMonths,
    };
  }, [loanAmount, interestRate, loanTerm, isYears]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <Banknote className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.loanAmount}</Label>
              <Input
                type="number"
                min="0"
                placeholder={isRTL ? '100000' : '100,000'}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.interestRate} (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="5.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.loanTerm}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  placeholder={isYears ? '30' : '360'}
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="tool-input flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Label className="text-xs">{labels.years}</Label>
                  <Switch checked={!isYears} onCheckedChange={(v) => setIsYears(!v)} />
                  <Label className="text-xs">{labels.months}</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{labels.monthlyPayment}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {labels.currency} {fmt(result.monthlyPayment)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{labels.totalPayment}</p>
                <p className="text-2xl font-bold text-foreground">
                  {labels.currency} {fmt(result.totalPayment)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{labels.totalInterest}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {labels.currency} {fmt(result.totalInterest)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Amortization Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{labels.showSchedule}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2 px-3 text-start">{labels.month}</th>
                      <th className="py-2 px-3 text-end">{labels.payment}</th>
                      <th className="py-2 px-3 text-end">{labels.principal}</th>
                      <th className="py-2 px-3 text-end">{labels.interest}</th>
                      <th className="py-2 px-3 text-end">{labels.balance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3">{row.month}</td>
                        <td className="py-2 px-3 text-end font-mono">{fmt(row.payment)}</td>
                        <td className="py-2 px-3 text-end font-mono text-emerald-600 dark:text-emerald-400">{fmt(row.principal)}</td>
                        <td className="py-2 px-3 text-end font-mono text-red-600 dark:text-red-400">{fmt(row.interest)}</td>
                        <td className="py-2 px-3 text-end font-mono">{fmt(row.balance)}</td>
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
