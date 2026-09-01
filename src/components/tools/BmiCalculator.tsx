'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Activity } from 'lucide-react';

export default function BmiCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [useMetric, setUseMetric] = useState(true);
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const labels = isRTL
    ? {
        title: 'حاسبة مؤشر كتلة الجسم',
        weight: 'الوزن',
        height: 'الطول',
        metric: 'متري',
        imperial: 'إمبراطوري',
        kg: 'كجم',
        lbs: 'رطل',
        cm: 'سم',
        ft: 'قدم',
        inch: 'بوصة',
        yourBmi: 'مؤشر كتلة جسمك',
        category: 'التصنيف',
        underweight: 'نقص الوزن',
        normal: 'طبيعي',
        overweight: 'زيادة الوزن',
        obese: 'سمنة',
        healthyRange: 'النطاق الصحي: 18.5 - 24.9',
        enterData: 'أدخل الوزن والطول لحساب المؤشر',
      }
    : {
        title: 'BMI Calculator',
        weight: 'Weight',
        height: 'Height',
        metric: 'Metric',
        imperial: 'Imperial',
        kg: 'kg',
        lbs: 'lbs',
        cm: 'cm',
        ft: 'ft',
        inch: 'in',
        yourBmi: 'Your BMI',
        category: 'Category',
        underweight: 'Underweight',
        normal: 'Normal',
        overweight: 'Overweight',
        obese: 'Obese',
        healthyRange: 'Healthy range: 18.5 - 24.9',
        enterData: 'Enter weight and height to calculate BMI',
      };

  const result = useMemo(() => {
    let weightKg: number;
    let heightM: number;

    if (useMetric) {
      weightKg = parseFloat(weight);
      heightM = parseFloat(heightCm) / 100;
    } else {
      weightKg = parseFloat(weight) * 0.453592;
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      heightM = (ft * 12 + inch) * 0.0254;
    }

    if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) return null;

    const bmi = weightKg / (heightM * heightM);

    let category: string;
    let color: string;
    let bgColor: string;

    if (bmi < 18.5) {
      category = labels.underweight;
      color = 'text-sky-600 dark:text-sky-400';
      bgColor = 'bg-sky-500';
    } else if (bmi < 25) {
      category = labels.normal;
      color = 'text-emerald-600 dark:text-emerald-400';
      bgColor = 'bg-emerald-500';
    } else if (bmi < 30) {
      category = labels.overweight;
      color = 'text-amber-600 dark:text-amber-400';
      bgColor = 'bg-amber-500';
    } else {
      category = labels.obese;
      color = 'text-red-600 dark:text-red-400';
      bgColor = 'bg-red-500';
    }

    return { bmi: Math.round(bmi * 10) / 10, category, color, bgColor };
  }, [weight, heightCm, heightFt, heightIn, useMetric, labels.underweight, labels.normal, labels.overweight, labels.obese]);

  // BMI scale position (0-40+ mapped to 0-100%)
  const scalePosition = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title">
            <Activity className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Unit Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <Label className="text-sm">{labels.metric}</Label>
            <Switch checked={!useMetric} onCheckedChange={(v) => setUseMetric(!v)} />
            <Label className="text-sm">{labels.imperial}</Label>
          </div>

          <div className="space-y-4">
            {/* Weight */}
            <div className="space-y-2">
              <Label>{labels.weight} ({useMetric ? labels.kg : labels.lbs})</Label>
              <Input
                type="number"
                min="0"
                placeholder={useMetric ? '70' : '154'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="tool-input"
              />
            </div>

            {/* Height */}
            {useMetric ? (
              <div className="space-y-2">
                <Label>{labels.height} ({labels.cm})</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="tool-input"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{labels.height} ({labels.ft})</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{labels.inch}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="9"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="tool-input"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result ? (
        <Card className="tool-wrapper-card border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.yourBmi}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${result.color}`}>
                {result.bmi.toFixed(1)}
              </div>
              <p className={`text-lg font-semibold mt-2 ${result.color}`}>
                {result.category}
              </p>
            </div>

            {/* BMI Scale */}
            <div className="space-y-2">
              <div className="relative h-6 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-sky-400 dark:bg-sky-600" style={{ width: '25%' }} />
                  <div className="bg-emerald-400 dark:bg-emerald-600" style={{ width: '25%' }} />
                  <div className="bg-amber-400 dark:bg-amber-600" style={{ width: '12.5%' }} />
                  <div className="bg-red-400 dark:bg-red-600" style={{ width: '37.5%' }} />
                </div>
                {/* Indicator */}
                <div
                  className="absolute top-0 h-full w-1 bg-foreground shadow-lg transform -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${scalePosition}%` }}
                />
              </div>
              {/* Scale labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sky-500">{labels.underweight}</span>
                <span className="text-emerald-500">{labels.normal}</span>
                <span className="text-amber-500">{labels.overweight}</span>
                <span className="text-red-500">{labels.obese}</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {labels.healthyRange}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="tool-wrapper-card border-dashed">
          <CardContent className="p-4 sm:p-6 py-8 text-center">
            <p className="text-muted-foreground">{labels.enterData}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
