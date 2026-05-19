'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Trash2, Clock } from 'lucide-react';

const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_AR = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

interface DayEntry {
  id: string;
  day: string;
  dayAr: string;
  startTime: string;
  endTime: string;
  breakMin: number;
}

export default function WorkHoursCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';

  const [days, setDays] = useState<DayEntry[]>([
    { id: '1', day: 'Monday', dayAr: 'الاثنين', startTime: '09:00', endTime: '17:00', breakMin: 60 },
    { id: '2', day: 'Tuesday', dayAr: 'الثلاثاء', startTime: '09:00', endTime: '17:00', breakMin: 60 },
    { id: '3', day: 'Wednesday', dayAr: 'الأربعاء', startTime: '09:00', endTime: '17:00', breakMin: 60 },
    { id: '4', day: 'Thursday', dayAr: 'الخميس', startTime: '09:00', endTime: '17:00', breakMin: 60 },
    { id: '5', day: 'Friday', dayAr: 'الجمعة', startTime: '09:00', endTime: '17:00', breakMin: 60 },
  ]);

  const calcDayHours = (entry: DayEntry) => {
    const [sh, sm] = entry.startTime.split(':').map(Number);
    const [eh, em] = entry.endTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin - entry.breakMin;
    return diff > 0 ? diff / 60 : 0;
  };

  const addDay = () => {
    const idx = days.length % 7;
    setDays((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        day: DAY_NAMES_EN[idx],
        dayAr: DAY_NAMES_AR[idx],
        startTime: '09:00',
        endTime: '17:00',
        breakMin: 60,
      },
    ]);
  };

  const removeDay = (id: string) => {
    setDays((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDay = (id: string, field: keyof DayEntry, value: string | number) => {
    setDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const weeklyTotal = days.reduce((sum, d) => sum + calcDayHours(d), 0);
  const weeklyOvertime = Math.max(0, weeklyTotal - 40);

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <Briefcase className="size-5" />
          {isAr ? 'حاسبة ساعات العمل' : 'Work Hours Calculator'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-sky-200 dark:border-sky-900">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{weeklyTotal.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'إجمالي الأسبوع' : 'Weekly Total'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{Math.min(weeklyTotal, 40).toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'ساعات عادية' : 'Regular Hours'}
            </div>
          </CardContent>
        </Card>
        <Card className={weeklyOvertime > 0 ? 'border-amber-200 dark:border-amber-900' : ''}>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{weeklyOvertime.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'ساعات إضافية (بعد 8 ساعات/يوم)' : 'Overtime (after 8h/day)'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day entries */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isAr ? 'جدول الأسبوع' : 'Week Schedule'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addDay} className="gap-1">
              <Plus className="size-4" />
              {isAr ? 'إضافة يوم' : 'Add Day'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {days.map((d) => {
            const hours = calcDayHours(d);
            const overtime = Math.max(0, hours - 8);
            return (
              <div
                key={d.id}
                className="rounded-lg border bg-muted/20 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-sky-500" />
                    <span className="font-medium text-sm">
                      {isAr ? d.dayAr : d.day}
                    </span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {hours.toFixed(1)}h
                    </Badge>
                    {overtime > 0 && (
                      <Badge variant="outline" className="text-xs font-mono text-amber-600 border-amber-300">
                        +{overtime.toFixed(1)}h OT
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-7"
                    onClick={() => removeDay(d.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">{isAr ? 'البداية' : 'Start'}</Label>
                    <Input
                      type="time"
                      value={d.startTime}
                      onChange={(e) => updateDay(d.id, 'startTime', e.target.value)}
                      className="tool-input text-xs font-mono h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">{isAr ? 'النهاية' : 'End'}</Label>
                    <Input
                      type="time"
                      value={d.endTime}
                      onChange={(e) => updateDay(d.id, 'endTime', e.target.value)}
                      className="tool-input text-xs font-mono h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">{isAr ? 'استراحة (د)' : 'Break (min)'}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={d.breakMin}
                      onChange={(e) => updateDay(d.id, 'breakMin', parseInt(e.target.value) || 0)}
                      className="tool-input text-xs font-mono h-8 text-center"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {days.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {isAr ? 'أضف أيام العمل لحساب الساعات' : 'Add work days to calculate hours'}
            </div>
          )}
        </CardContent>
      </Card>
      </CardContent>
    </Card>
  );
}
