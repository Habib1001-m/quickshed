'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  EGP: 48.50,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  CAD: 1.36,
  AUD: 1.53,
};

const CURRENCY_NAMES: Record<string, Record<string, string>> = {
  USD: { en: 'US Dollar', ar: 'دولار أمريكي' },
  EUR: { en: 'Euro', ar: 'يورو' },
  GBP: { en: 'British Pound', ar: 'جنيه إسترليني' },
  SAR: { en: 'Saudi Riyal', ar: 'ريال سعودي' },
  AED: { en: 'UAE Dirham', ar: 'درهم إماراتي' },
  EGP: { en: 'Egyptian Pound', ar: 'جنيه مصري' },
  JPY: { en: 'Japanese Yen', ar: 'ين ياباني' },
  CNY: { en: 'Chinese Yuan', ar: 'يوان صيني' },
  INR: { en: 'Indian Rupee', ar: 'روبية هندية' },
  CAD: { en: 'Canadian Dollar', ar: 'دولار كندي' },
  AUD: { en: 'Australian Dollar', ar: 'دولار أسترالي' },
};

export default function CurrencyConverterCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  const labels = isRTL
    ? {
        title: 'محول العملات',
        amount: 'المبلغ',
        from: 'من',
        to: 'إلى',
        result: 'النتيجة',
        exchangeRate: 'سعر الصرف',
        swap: 'تبديل',
        disclaimer: 'الأسعار تقريبية وللاطلاع فقط',
        enterAmount: 'أدخل المبلغ لتحويل العملات',
      }
    : {
        title: 'Currency Converter',
        amount: 'Amount',
        from: 'From',
        to: 'To',
        result: 'Result',
        exchangeRate: 'Exchange Rate',
        swap: 'Swap',
        disclaimer: 'Rates are approximate and for reference only',
        enterAmount: 'Enter an amount to convert',
      };

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return null;

    const fromRate = EXCHANGE_RATES[fromCurrency];
    const toRate = EXCHANGE_RATES[toCurrency];

    if (!fromRate || !toRate) return null;

    // Convert: amount in FROM -> USD -> TO
    const inUSD = val / fromRate;
    const converted = inUSD * toRate;
    const rate = toRate / fromRate;

    return { converted, rate };
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const fmt = (val: number) => {
    const decimals = toCurrency === 'JPY' ? 0 : 2;
    return val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const currencies = Object.keys(EXCHANGE_RATES);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <ArrowLeftRight className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.amount}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="1.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tool-input"
              />
            </div>

            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2 space-y-2">
                <Label>{labels.from}</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code} - {CURRENCY_NAMES[code]?.[locale] || code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwap}
                  className="rounded-full"
                >
                  <ArrowUpDown className="size-4" />
                </Button>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>{labels.to}</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code} - {CURRENCY_NAMES[code]?.[locale] || code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.result}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="tool-output text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-muted-foreground mb-1">
                  {parseFloat(amount).toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })} {fromCurrency}
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(result.converted)} {toCurrency}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">{labels.exchangeRate}</span>
                <span className="font-mono font-semibold">
                  1 {fromCurrency} = {fmt(result.rate)} {toCurrency}
                </span>
              </div>

              <p className="text-center text-xs text-muted-foreground italic">
                ⚠️ {labels.disclaimer}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{labels.enterAmount}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
