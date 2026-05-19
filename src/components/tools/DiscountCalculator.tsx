'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';

export default function DiscountCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [taxPercent, setTaxPercent] = useState('');

  const labels = isRTL
    ? {
        title: 'حاسبة الخصم',
        originalPrice: 'السعر الأصلي',
        discountPercent: 'نسبة الخصم',
        taxPercent: 'نسبة الضريبة (اختياري)',
        discountAmount: 'مبلغ الخصم',
        priceAfterDiscount: 'السعر بعد الخصم',
        taxAmount: 'مبلغ الضريبة',
        totalWithTax: 'الإجمالي مع الضريبة',
        youSave: 'وفرت',
        currency: 'ر.س',
        optional: 'اختياري',
      }
    : {
        title: 'Discount Calculator',
        originalPrice: 'Original Price',
        discountPercent: 'Discount Percentage',
        taxPercent: 'Tax Percentage (optional)',
        discountAmount: 'Discount Amount',
        priceAfterDiscount: 'Price After Discount',
        taxAmount: 'Tax Amount',
        totalWithTax: 'Total with Tax',
        youSave: 'You Save',
        currency: '$',
        optional: 'optional',
      };

  const result = useMemo(() => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);
    const tax = parseFloat(taxPercent) || 0;

    if (isNaN(price) || isNaN(discount) || price <= 0) return null;

    const discountAmount = price * (discount / 100);
    const priceAfterDiscount = price - discountAmount;
    const taxAmount = priceAfterDiscount * (tax / 100);
    const totalWithTax = priceAfterDiscount + taxAmount;

    return { discountAmount, priceAfterDiscount, taxAmount, totalWithTax };
  }, [originalPrice, discountPercent, taxPercent]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <Tag className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.originalPrice}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={isRTL ? '100.00' : '100.00'}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.discountPercent} (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="25"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {labels.taxPercent}
                <span className="text-xs text-muted-foreground">({labels.optional})</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="15"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="tool-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.priceAfterDiscount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">{labels.discountAmount}</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  - {labels.currency} {fmt(result.discountAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">{labels.priceAfterDiscount}</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {labels.currency} {fmt(result.priceAfterDiscount)}
                </span>
              </div>

              {parseFloat(taxPercent) > 0 && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">{labels.taxAmount}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      + {labels.currency} {fmt(result.taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-foreground/5 border">
                    <span className="font-semibold text-foreground">{labels.totalWithTax}</span>
                    <span className="text-xl font-bold text-foreground">
                      {labels.currency} {fmt(result.totalWithTax)}
                    </span>
                  </div>
                </>
              )}

              {/* Savings Badge */}
              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 text-sm font-semibold">
                  {labels.youSave}: {labels.currency} {fmt(result.discountAmount)} ({discountPercent}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {isRTL ? 'أدخل السعر ونسبة الخصم' : 'Enter price and discount percentage'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
