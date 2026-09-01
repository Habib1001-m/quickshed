'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Percent } from 'lucide-react';

export default function PercentageCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [mode, setMode] = useState('what-is');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  const labels = isRTL
    ? {
        title: 'حاسبة النسبة المئوية',
        input: 'الإدخال',
        result: 'النتيجة',
        whatIs: 'ما هو X% من Y؟',
        whatPercent: 'X هو ما نسبته من Y؟',
        percentChange: 'التغيير % من X إلى Y',
        x: 'القيمة X',
        y: 'القيمة Y',
        calculate: 'احسب',
        resultLabel: 'النتيجة',
        from: 'من',
        to: 'إلى',
      }
    : {
        title: 'Percentage Calculator',
        input: 'Input',
        result: 'Result',
        whatIs: 'What is X% of Y?',
        whatPercent: 'X is what % of Y?',
        percentChange: '% change from X to Y',
        x: 'Value X',
        y: 'Value Y',
        calculate: 'Calculate',
        resultLabel: 'Result',
        from: 'From',
        to: 'To',
      };

  const result = useMemo(() => {
    const x = parseFloat(val1);
    const y = parseFloat(val2);
    if (isNaN(x) || isNaN(y)) return null;

    switch (mode) {
      case 'what-is':
        return (x / 100) * y;
      case 'what-percent':
        if (y === 0) return null;
        return (x / y) * 100;
      case 'percent-change':
        if (x === 0) return null;
        return ((y - x) / Math.abs(x)) * 100;
      default:
        return null;
    }
  }, [mode, val1, val2]);

  const formatResult = (val: number) => {
    if (mode === 'what-is') {
      return val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { maximumFractionDigits: 4 });
    }
    return val.toFixed(4).replace(/\.?0+$/, '') + '%';
  };

  const getResultDescription = () => {
    if (result === null) return '';
    const x = parseFloat(val1);
    const y = parseFloat(val2);
    switch (mode) {
      case 'what-is':
        return isRTL
          ? `${x}% من ${y} = ${formatResult(result)}`
          : `${x}% of ${y} = ${formatResult(result)}`;
      case 'what-percent':
        return isRTL
          ? `${x} هو ${formatResult(result)} من ${y}`
          : `${x} is ${formatResult(result)} of ${y}`;
      case 'percent-change':
        const direction = result > 0 ? (isRTL ? 'زيادة' : 'increase') : (isRTL ? 'نقصان' : 'decrease');
        return isRTL
          ? `${direction} بنسبة ${formatResult(Math.abs(result))} من ${x} إلى ${y}`
          : `${direction} of ${formatResult(Math.abs(result))} from ${x} to ${y}`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title">
            <Percent className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="what-is">{labels.whatIs}</TabsTrigger>
              <TabsTrigger value="what-percent">{labels.whatPercent}</TabsTrigger>
              <TabsTrigger value="percent-change">{labels.percentChange}</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <TabsContent value="what-is" className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'ما نسبته؟ (%)' : 'What percentage? (%)'}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 25' : 'e.g. 25'}
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'من الرقم؟' : 'Of what number?'}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 200' : 'e.g. 200'}
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="tool-input"
                  />
                </div>
              </TabsContent>

              <TabsContent value="what-percent" className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الرقم' : 'The number'}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 50' : 'e.g. 50'}
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'من الرقم الكلي؟' : 'Of what total?'}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 200' : 'e.g. 200'}
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="tool-input"
                  />
                </div>
              </TabsContent>

              <TabsContent value="percent-change" className="space-y-4">
                <div className="space-y-2">
                  <Label>{labels.from}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 100' : 'e.g. 100'}
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{labels.to}</Label>
                  <Input
                    type="number"
                    placeholder={isRTL ? 'مثال: 150' : 'e.g. 150'}
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="tool-input"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result */}
      {result !== null && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.resultLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tool-output text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatResult(result)}
              </div>
              <p className="text-muted-foreground">
                {getResultDescription()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
