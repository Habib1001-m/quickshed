'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';

const ZONES = [
  { value: 'UTC', label: 'UTC', labelAr: 'التوقيت العالمي' },
  { value: 'America/New_York', label: 'New York (EST/EDT)', labelAr: 'نيويورك' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', labelAr: 'شيكاغو' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', labelAr: 'دنفر' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', labelAr: 'لوس أنجلوس' },
  { value: 'Europe/London', label: 'London (GMT/BST)', labelAr: 'لندن' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', labelAr: 'باريس' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', labelAr: 'برلين' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', labelAr: 'موسكو' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', labelAr: 'دبي' },
  { value: 'Asia/Kolkata', label: 'India (IST)', labelAr: 'الهند' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', labelAr: 'شنغهاي' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', labelAr: 'طوكيو' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', labelAr: 'سيول' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)', labelAr: 'الرياض' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', labelAr: 'القاهرة' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', labelAr: 'سيدني' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', labelAr: 'أوكلاند' },
];

export default function TimeZoneConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [fromZone, setFromZone] = useState('America/New_York');
  const [toZone, setToZone] = useState('Asia/Dubai');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  // Set default to now
  const getDefaultDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
  };

  const fromDateTime = useMemo(() => {
    const defaults = getDefaultDateTime();
    const d = dateStr || defaults.date;
    const t = timeStr || defaults.time;
    return new Date(`${d}T${t}:00`);
  }, [dateStr, timeStr]);

  const convertedTime = useMemo(() => {
    if (isNaN(fromDateTime.getTime())) return null;
    try {
      const fromStr = fromDateTime.toLocaleString('en-US', { timeZone: fromZone });
      const fromDate = new Date(fromStr);
      const toStr = fromDateTime.toLocaleString('en-US', { timeZone: toZone });
      const toDate = new Date(toStr);
      const offset = toDate.getTime() - fromDate.getTime();

      const result = new Date(fromDateTime.getTime() + offset);

      return {
        date: result.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: toZone,
        }),
        time: result.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: toZone,
        }),
        zone: toZone,
      };
    } catch {
      return null;
    }
  }, [fromDateTime, fromZone, toZone, isAr]);

  const fromDisplay = useMemo(() => {
    if (isNaN(fromDateTime.getTime())) return null;
    try {
      return {
        date: fromDateTime.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: fromZone,
        }),
        time: fromDateTime.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: fromZone,
        }),
      };
    } catch {
      return null;
    }
  }, [fromDateTime, fromZone, isAr]);

  const swap = () => {
    const temp = fromZone;
    setFromZone(toZone);
    setToZone(temp);
  };

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <ArrowRightLeft className="size-5" />
          {isAr ? 'محول المنطقة الزمنية' : 'Time Zone Converter'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Date and Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{isAr ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="tool-input font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'الوقت' : 'Time'}</Label>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="tool-input font-mono"
              />
            </div>
          </div>

          {/* From/To zones */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>{isAr ? 'من منطقة' : 'From Zone'}</Label>
              <Select value={fromZone} onValueChange={setFromZone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {isAr ? z.labelAr : z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={swap} className="shrink-0 mb-0.5">
              <ArrowRightLeft className="size-4" />
            </Button>
            <div className="flex-1 space-y-1.5">
              <Label>{isAr ? 'إلى منطقة' : 'To Zone'}</Label>
              <Select value={toZone} onValueChange={setToZone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z.value} value={z.value}>
                      {isAr ? z.labelAr : z.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="tool-output grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-sky-200 dark:border-sky-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isAr ? 'الوقت الأصلي' : 'Original Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fromDisplay ? (
              <div>
                <div className="text-xl font-semibold font-mono">{fromDisplay.time}</div>
                <div className="text-sm text-muted-foreground mt-1">{fromDisplay.date}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">--</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isAr ? 'الوقت المحول' : 'Converted Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {convertedTime ? (
              <div>
                <div className="text-xl font-semibold font-mono">{convertedTime.time}</div>
                <div className="text-sm text-muted-foreground mt-1">{convertedTime.date}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">--</div>
            )}
          </CardContent>
        </Card>
      </div>
      </CardContent>
    </Card>
  );
}
