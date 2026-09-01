'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Fuel } from 'lucide-react';

export default function FuelCostCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [useMetric, setUseMetric] = useState(true);
  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');

  const labels = isRTL
    ? {
        title: 'حاسبة تكلفة الوقود',
        distance: 'المسافة',
        efficiency: 'كفاءة استهلاك الوقود',
        fuelPrice: 'سعر الوقود لكل وحدة',
        totalFuel: 'إجمالي الوقود المطلوب',
        totalCost: 'التكلفة الإجمالية',
        km: 'كم',
        mi: 'ميل',
        lPer100km: 'لتر/100كم',
        mpg: 'ميل/جالون',
        perLiter: 'لكل لتر',
        perGallon: 'لكل جالون',
        liters: 'لتر',
        gallons: 'جالون',
        currency: 'ر.س',
        enterData: 'أدخل بيانات الرحلة لحساب التكلفة',
        metric: 'متري',
        imperial: 'إمبراطوري',
      }
    : {
        title: 'Fuel Cost Calculator',
        distance: 'Distance',
        efficiency: 'Fuel Efficiency',
        fuelPrice: 'Fuel Price per Unit',
        totalFuel: 'Total Fuel Needed',
        totalCost: 'Total Cost',
        km: 'km',
        mi: 'mi',
        lPer100km: 'L/100km',
        mpg: 'MPG',
        perLiter: 'per liter',
        perGallon: 'per gallon',
        liters: 'liters',
        gallons: 'gallons',
        currency: '$',
        enterData: 'Enter trip details to calculate fuel cost',
        metric: 'Metric',
        imperial: 'Imperial',
      };

  const result = useMemo(() => {
    const dist = parseFloat(distance);
    const eff = parseFloat(efficiency);
    const price = parseFloat(fuelPrice);

    if (isNaN(dist) || isNaN(eff) || isNaN(price) || dist <= 0 || eff <= 0 || price <= 0) return null;

    let totalFuel: number;
    let totalCost: number;

    if (useMetric) {
      // efficiency is L/100km, distance is km
      totalFuel = (dist / 100) * eff;
      totalCost = totalFuel * price;
    } else {
      // efficiency is MPG, distance is miles
      totalFuel = dist / eff; // gallons
      totalCost = totalFuel * price;
    }

    return { totalFuel, totalCost };
  }, [distance, efficiency, fuelPrice, useMetric]);

  const fmt = (val: number) => val.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <Fuel className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Unit Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <Label className="text-sm">{labels.metric}</Label>
            <Switch checked={!useMetric} onCheckedChange={(v) => setUseMetric(!v)} />
            <Label className="text-sm">{labels.imperial}</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.distance} ({useMetric ? labels.km : labels.mi})</Label>
              <Input
                type="number"
                min="0"
                placeholder={useMetric ? '500' : '310'}
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.efficiency} ({useMetric ? labels.lPer100km : labels.mpg})</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder={useMetric ? '8.5' : '28'}
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.fuelPrice} ({useMetric ? labels.perLiter : labels.perGallon})</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={useMetric ? '2.50' : '3.50'}
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                className="tool-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.totalCost}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-muted-foreground">{labels.totalFuel}</span>
                <span className="text-xl font-semibold text-foreground">
                  {fmt(result.totalFuel)} {useMetric ? labels.liters : labels.gallons}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{labels.totalCost}</span>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {labels.currency} {fmt(result.totalCost)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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
