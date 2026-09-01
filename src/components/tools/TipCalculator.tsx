'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Receipt, Users } from 'lucide-react';

export default function TipCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState('15');
  const [numPeople, setNumPeople] = useState('1');

  const labels = isRTL
    ? {
        title: 'حاسبة البقشيش',
        billAmount: 'مبلغ الفاتورة',
        tipPercentage: 'نسبة البقشيش',
        customTip: 'نسبة مخصصة',
        numberOfPeople: 'عدد الأشخاص',
        tipAmount: 'مبلغ البقشيش',
        totalAmount: 'المبلغ الإجمالي',
        perPerson: 'لكل شخص',
        perPersonTip: 'البقشيش لكل شخص',
        quickTips: 'نسب سريعة',
        currency: 'ر.س',
      }
    : {
        title: 'Tip Calculator',
        billAmount: 'Bill Amount',
        tipPercentage: 'Tip Percentage',
        customTip: 'Custom %',
        numberOfPeople: 'Number of People',
        tipAmount: 'Tip Amount',
        totalAmount: 'Total Amount',
        perPerson: 'Per Person',
        perPersonTip: 'Tip Per Person',
        quickTips: 'Quick Tips',
        currency: '$',
      };

  const quickTips = [10, 15, 18, 20, 25];

  const result = useMemo(() => {
    const bill = parseFloat(billAmount);
    const tip = parseFloat(tipPercent);
    const people = parseInt(numPeople);

    if (isNaN(bill) || isNaN(tip) || isNaN(people) || bill <= 0 || tip < 0 || people < 1) return null;

    const tipAmount = bill * (tip / 100);
    const totalAmount = bill + tipAmount;
    const perPerson = totalAmount / people;
    const perPersonTip = tipAmount / people;

    return { tipAmount, totalAmount, perPerson, perPersonTip };
  }, [billAmount, tipPercent, numPeople]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <Receipt className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.billAmount}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={isRTL ? '100.00' : '100.00'}
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="tool-input"
              />
            </div>

            {/* Quick Tip Buttons */}
            <div className="space-y-2">
              <Label>{labels.quickTips}</Label>
              <div className="flex flex-wrap gap-2">
                {quickTips.map((pct) => (
                  <Button
                    key={pct}
                    variant={tipPercent === String(pct) ? 'default' : 'outline'}
                    size="sm"
                    className={tipPercent === String(pct) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => setTipPercent(String(pct))}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{labels.customTip} (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="15"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                className="tool-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="size-4" />
                {labels.numberOfPeople}
              </Label>
              <Input
                type="number"
                min="1"
                max="100"
                placeholder="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="tool-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.totalAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{labels.tipAmount}</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {labels.currency} {fmt(result.tipAmount)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{labels.totalAmount}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {labels.currency} {fmt(result.totalAmount)}
                  </p>
                </div>
              </div>

              {parseInt(numPeople) > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-muted-foreground mb-1">{labels.perPerson}</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {labels.currency} {fmt(result.perPerson)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">{labels.perPersonTip}</p>
                    <p className="text-xl font-bold text-foreground">
                      {labels.currency} {fmt(result.perPersonTip)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {isRTL ? 'أدخل مبلغ الفاتورة لحساب البقشيش' : 'Enter bill amount to calculate tip'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
