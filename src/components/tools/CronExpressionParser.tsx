'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, CalendarClock, Zap } from 'lucide-react';

const labels = {
  en: {
    title: 'Cron Expression Parser',
    inputPlaceholder: 'e.g. */5 * * * *',
    minutes: 'Minutes',
    hours: 'Hours',
    dayOfMonth: 'Day of Month',
    month: 'Month',
    dayOfWeek: 'Day of Week',
    seconds: 'Seconds (optional)',
    description: 'Description',
    nextExecutions: 'Next 5 Executions',
    presets: 'Common Presets',
    everyMinute: 'Every minute',
    every5Minutes: 'Every 5 minutes',
    every15Minutes: 'Every 15 minutes',
    every30Minutes: 'Every 30 minutes',
    hourly: 'Every hour',
    daily: 'Every day at midnight',
    daily6am: 'Every day at 6 AM',
    weekly: 'Every Sunday at midnight',
    monthly: 'Every 1st of month at midnight',
    weekdays: 'Every weekday at 9 AM',
    invalid: 'Invalid cron expression',
    fieldDesc: {
      minute: 'Minute (0-59)',
      hour: 'Hour (0-23)',
      dom: 'Day of Month (1-31)',
      month: 'Month (1-12)',
      dow: 'Day of Week (0-6, 0=Sun)',
      second: 'Second (0-59)',
    },
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    every: 'Every',
    at: 'at',
    on: 'on',
    and: 'and',
    through: 'through',
    past: 'past',
    inMonth: 'in',
    secondsUnit: 'seconds',
  },
  ar: {
    title: 'محلل تعبيرات Cron',
    inputPlaceholder: 'مثال: */5 * * * *',
    minutes: 'الدقائق',
    hours: 'الساعات',
    dayOfMonth: 'يوم الشهر',
    month: 'الشهر',
    dayOfWeek: 'يوم الأسبوع',
    seconds: 'الثواني (اختياري)',
    description: 'الوصف',
    nextExecutions: 'التنفيذات الخمس التالية',
    presets: 'القوالب الشائعة',
    everyMinute: 'كل دقيقة',
    every5Minutes: 'كل 5 دقائق',
    every15Minutes: 'كل 15 دقيقة',
    every30Minutes: 'كل 30 دقيقة',
    hourly: 'كل ساعة',
    daily: 'كل يوم في منتصف الليل',
    daily6am: 'كل يوم في الساعة 6 صباحاً',
    weekly: 'كل أحد في منتصف الليل',
    monthly: 'كل أول شهر في منتصف الليل',
    weekdays: 'كل يوم عمل في الساعة 9 صباحاً',
    invalid: 'تعبير cron غير صالح',
    fieldDesc: {
      minute: 'دقيقة (0-59)',
      hour: 'ساعة (0-23)',
      dom: 'يوم الشهر (1-31)',
      month: 'شهر (1-12)',
      dow: 'يوم الأسبوع (0-6، 0=أحد)',
      second: 'ثانية (0-59)',
    },
    monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    dayNames: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    every: 'كل',
    at: 'في',
    on: 'في',
    and: 'و',
    through: 'إلى',
    past: 'بعد',
    inMonth: 'في',
    secondsUnit: 'ثوانٍ',
  },
};

const PRESETS = [
  { labelEn: 'Every minute', labelAr: 'كل دقيقة', expr: '* * * * *' },
  { labelEn: 'Every 5 minutes', labelAr: 'كل 5 دقائق', expr: '*/5 * * * *' },
  { labelEn: 'Every 15 minutes', labelAr: 'كل 15 دقيقة', expr: '*/15 * * * *' },
  { labelEn: 'Every 30 minutes', labelAr: 'كل 30 دقيقة', expr: '*/30 * * * *' },
  { labelEn: 'Every hour', labelAr: 'كل ساعة', expr: '0 * * * *' },
  { labelEn: 'Every day at midnight', labelAr: 'كل يوم في منتصف الليل', expr: '0 0 * * *' },
  { labelEn: 'Every day at 6 AM', labelAr: 'كل يوم في 6 صباحاً', expr: '0 6 * * *' },
  { labelEn: 'Every Sunday at midnight', labelAr: 'كل أحد في منتصف الليل', expr: '0 0 * * 0' },
  { labelEn: 'Every 1st of month at midnight', labelAr: 'كل أول شهر في منتصف الليل', expr: '0 0 1 * *' },
  { labelEn: 'Every weekday at 9 AM', labelAr: 'كل يوم عمل في 9 صباحاً', expr: '0 9 * * 1-5' },
];

/* ---------- parse cron field ---------- */
function parseCronField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    const result: number[] = [];
    for (let i = min; i <= max; i++) result.push(i);
    return result;
  }

  if (field.includes(',')) {
    const values: number[] = [];
    for (const part of field.split(',')) {
      values.push(...parseCronField(part, min, max));
    }
    return [...new Set(values)].sort((a, b) => a - b);
  }

  if (field.includes('/')) {
    const [range, stepStr] = field.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step <= 0) return [];
    const rangeValues = parseCronField(range || '*', min, max);
    return rangeValues.filter((_, i) => i % step === 0);
  }

  if (field.includes('-')) {
    const [startStr, endStr] = field.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) return [];
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  const val = parseInt(field, 10);
  if (isNaN(val)) return [];
  return [val];
}

type CronSchedule = {
  seconds: string | null;
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
};

/* Five fields: minute hour day-of-month month day-of-week.
 * Six fields: seconds minute hour day-of-month month day-of-week. */
function normalizeCronFields(fields: string[]): CronSchedule | null {
  if (fields.length === 6) {
    return {
      seconds: fields[0],
      minute: fields[1],
      hour: fields[2],
      dom: fields[3],
      month: fields[4],
      dow: fields[5],
    };
  }

  if (fields.length === 5) {
    return {
      seconds: null,
      minute: fields[0],
      hour: fields[1],
      dom: fields[2],
      month: fields[3],
      dow: fields[4],
    };
  }

  return null;
}

/* ---------- human-readable description ---------- */
function describeCron(schedule: CronSchedule, t: typeof labels.en): string {
  const { seconds, minute, hour, dom, month, dow } = schedule;
  const parts: string[] = [];
  const fixedMinute = /^\d+$/.test(minute);
  const fixedHour = /^\d+$/.test(hour);
  const fixedSecond = seconds !== null && /^\d+$/.test(seconds);
  const includeSecondInTime = fixedHour && fixedMinute && fixedSecond;

  // Seconds are only present in the six-field form.
  if (seconds !== null && seconds !== '*') {
    if (seconds.startsWith('*/')) {
      parts.push(`${t.every} ${seconds.slice(2)} ${t.secondsUnit}`);
    } else if (!includeSecondInTime) {
      parts.push(`${t.at} ${t.secondsUnit} ${seconds}`);
    }
  }

  // Minute
  if (minute === '*') {
    // every minute
  } else if (minute.startsWith('*/')) {
    parts.push(`${t.every} ${minute.slice(2)} ${t.minutes.toLowerCase()}`);
  } else {
    parts.push(`${t.at} ${t.minutes.toLowerCase()} ${minute}`);
  }

  // Hour
  if (hour !== '*') {
    if (hour.startsWith('*/')) {
      parts.push(`${t.every} ${hour.slice(2)} ${t.hours.toLowerCase()}`);
    } else {
      const minuteForTime = fixedMinute ? minute.padStart(2, '0') : minute === '*' ? '00' : minute;
      const secondForTime = includeSecondInTime ? seconds!.padStart(2, '0') : '';
      parts.push(`${t.at} ${hour}:${minuteForTime}${secondForTime ? `:${secondForTime}` : ''}`);
    }
  }

  // Day of week
  if (dow !== '*') {
    const dayIdx = parseInt(dow, 10);
    if (!isNaN(dayIdx) && dayIdx >= 0 && dayIdx <= 6) {
      parts.push(`${t.on} ${t.dayNames[dayIdx]}`);
    } else if (dow.includes('-')) {
      const [s, e] = dow.split('-').map(Number);
      const names: string[] = [];
      for (let i = s; i <= e; i++) names.push(t.dayNames[i]);
      parts.push(`${t.on} ${names.join(` ${t.and} `)}`);
    }
  }

  // Day of month
  if (dom !== '*' && dow === '*') {
    parts.push(`${t.on} ${t.dayOfMonth.toLowerCase()} ${dom}`);
  }

  // Month
  if (month !== '*') {
    const monthIdx = parseInt(month, 10);
    if (!isNaN(monthIdx) && monthIdx >= 1 && monthIdx <= 12) {
      parts.push(`${t.inMonth} ${t.monthNames[monthIdx - 1]}`);
    }
  }

  if (parts.length === 0) return t.everyMinute;
  return parts.join(', ');
}

/* ---------- next N execution times ---------- */
function getNextExecutions(schedule: CronSchedule, count: number): Date[] {
  if (count <= 0) return [];

  const seconds = (schedule.seconds === null ? [0] : parseCronField(schedule.seconds, 0, 59))
    .filter((value) => value >= 0 && value <= 59);
  const minutes = parseCronField(schedule.minute, 0, 59);
  const hours = parseCronField(schedule.hour, 0, 23);
  const doms = parseCronField(schedule.dom, 1, 31);
  const months = parseCronField(schedule.month, 1, 12);
  const dows = parseCronField(schedule.dow, 0, 6);

  if (
    seconds.length === 0 ||
    minutes.length === 0 ||
    hours.length === 0 ||
    doms.length === 0 ||
    months.length === 0 ||
    dows.length === 0
  ) {
    return [];
  }

  const results: Date[] = [];
  const start = new Date();
  const cursor = new Date(start);

  if (schedule.seconds === null) {
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
  } else {
    cursor.setMilliseconds(0);
  }

  const maxIterations = 366 * 24 * 60; // one leap-year of minute candidates
  let iter = 0;

  while (results.length < count && iter < maxIterations) {
    if (
      months.includes(cursor.getMonth() + 1) &&
      doms.includes(cursor.getDate()) &&
      dows.includes(cursor.getDay()) &&
      hours.includes(cursor.getHours()) &&
      minutes.includes(cursor.getMinutes())
    ) {
      if (schedule.seconds === null) {
        results.push(new Date(cursor));
      } else {
        for (const second of seconds) {
          const candidate = new Date(cursor);
          candidate.setSeconds(second, 0);
          if (candidate <= start) continue;
          results.push(candidate);
          if (results.length >= count) break;
        }
      }
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
    iter++;
  }

  return results;
}

/* ---------- main component ---------- */
export default function CronExpressionParser({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [expression, setExpression] = useState('*/5 * * * *');
  const [builderFields, setBuilderFields] = useState<CronSchedule>({
    seconds: null,
    minute: '*/5',
    hour: '*',
    dom: '*',
    month: '*',
    dow: '*',
  });

  const fields = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    return parts;
  }, [expression]);

  const schedule = useMemo(() => normalizeCronFields(fields), [fields]);
  const isValid = schedule !== null;
  const hasSecondsField = schedule !== null && schedule.seconds !== null;

  const parsedDescription = useMemo(() => {
    if (schedule === null) return t.invalid;
    return describeCron(schedule, t);
  }, [schedule, t]);

  const nextTimes = useMemo(() => {
    if (schedule === null) return [];
    return getNextExecutions(schedule, 5);
  }, [schedule]);

  const handlePreset = useCallback((expr: string) => {
    setExpression(expr);
    const presetSchedule = normalizeCronFields(expr.split(/\s+/));
    if (presetSchedule !== null) {
      setBuilderFields(presetSchedule);
    }
  }, []);

  const handleExpressionChange = useCallback((value: string) => {
    setExpression(value);
    const parsedSchedule = normalizeCronFields(value.trim().split(/\s+/));
    if (parsedSchedule !== null) {
      setBuilderFields(parsedSchedule);
    }
  }, []);

  const handleBuilderChange = useCallback((field: keyof CronSchedule, value: string) => {
    const updated = { ...builderFields };
    if (field === 'seconds') {
      updated.seconds = value.trim() === '' ? null : value;
    } else {
      updated[field] = value;
    }

    setBuilderFields(updated);
    const expressionFields = updated.seconds === null
      ? [updated.minute, updated.hour, updated.dom, updated.month, updated.dow]
      : [updated.seconds, updated.minute, updated.hour, updated.dom, updated.month, updated.dow];
    setExpression(expressionFields.join(' '));
  }, [builderFields]);

  const fieldBreakdown = schedule === null
    ? []
    : [
        ...(schedule.seconds === null
          ? []
          : [{ key: 'seconds', label: t.seconds, value: schedule.seconds }]),
        { key: 'minute', label: t.minutes, value: schedule.minute },
        { key: 'hour', label: t.hours, value: schedule.hour },
        { key: 'dom', label: t.dayOfMonth, value: schedule.dom },
        { key: 'month', label: t.month, value: schedule.month },
        { key: 'dow', label: t.dayOfWeek, value: schedule.dow },
      ];

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Clock className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Cron</Label>
            <Input
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="tool-input font-mono text-base"
            />
          </div>

          {!isValid && (
            <Badge variant="destructive">{t.invalid}</Badge>
          )}

          {/* Field breakdown */}
          {isValid && (
            <div className={`grid ${hasSecondsField ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-5'} gap-2 text-center`}>
              {fieldBreakdown.map((f) => (
                <div key={f.key} className="space-y-1">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <code className="block bg-muted rounded px-2 py-1 font-mono text-sm">{f.value}</code>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="size-4" />
            {t.presets}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.expr}
                variant={expression === p.expr ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePreset(p.expr)}
              >
                {locale === 'ar' ? p.labelAr : p.labelEn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual schedule builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'en' ? 'Schedule Builder' : 'منشئ الجدول'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { key: 'seconds' as const, label: t.fieldDesc.second, placeholder: '*' },
              { key: 'minute' as const, label: t.fieldDesc.minute, placeholder: '*/5' },
              { key: 'hour' as const, label: t.fieldDesc.hour, placeholder: '*' },
              { key: 'dom' as const, label: t.fieldDesc.dom, placeholder: '*' },
              { key: 'month' as const, label: t.fieldDesc.month, placeholder: '*' },
              { key: 'dow' as const, label: t.fieldDesc.dow, placeholder: '*' },
            ]).map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  value={builderFields[f.key] ?? ''}
                  onChange={(e) => handleBuilderChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="tool-input font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {isValid && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="tool-section-title text-sm">{t.description}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{parsedDescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Next executions */}
      {isValid && nextTimes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4" />
              {t.nextExecutions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextTimes.map((dt, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-md px-3 py-2">
                  <Badge variant="secondary" className="shrink-0">#{i + 1}</Badge>
                  <span className="text-sm font-mono">{dt.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: hasSecondsField ? '2-digit' : undefined,
                  })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
