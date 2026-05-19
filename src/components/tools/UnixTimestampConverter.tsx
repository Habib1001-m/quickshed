'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';

export default function UnixTimestampConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [inputTs, setInputTs] = useState('');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [dateInput, setDateInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCurrentTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Timestamp → Date
  const tsToDate = () => {
    const raw = parseInt(inputTs);
    if (isNaN(raw)) return null;
    const ms = unit === 'seconds' ? raw * 1000 : raw;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // Date → Timestamp
  const dateToTs = () => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const convertedDate = tsToDate();
  const convertedTs = dateToTs();

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <ArrowRightLeft className="size-5" />
          {isAr ? 'محول الطابع الزمني يونكس' : 'Unix Timestamp Converter'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      {/* Live current timestamp */}
      <Card className="border-sky-200 dark:border-sky-900">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs text-muted-foreground">
                {isAr ? 'الطابع الزمني الحالي (يونكس)' : 'Current Unix Timestamp'}
              </div>
              <div className="text-2xl font-mono font-bold text-foreground">{currentTs}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(currentTs.toString())}
              className="gap-1"
            >
              {copied ? <span className="copy-feedback"><Check className="size-3.5" /></span> : <Copy className="size-3.5" />}
              {copied
                ? <span className="copy-feedback">{isAr ? 'تم النسخ' : 'Copied'}</span>
                : isAr ? 'نسخ' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ts2date">
        <TabsList className="w-full">
          <TabsTrigger value="ts2date" className="flex-1">
            {isAr ? 'طابع → تاريخ' : 'Timestamp → Date'}
          </TabsTrigger>
          <TabsTrigger value="date2ts" className="flex-1">
            {isAr ? 'تاريخ → طابع' : 'Date → Timestamp'}
          </TabsTrigger>
        </TabsList>

        {/* Timestamp to Date */}
        <TabsContent value="ts2date">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{isAr ? 'الطابع الزمني' : 'Unix Timestamp'}</Label>
                <Input
                  type="text"
                  value={inputTs}
                  onChange={(e) => setInputTs(e.target.value)}
                  placeholder={isAr ? 'أدخل الطابع الزمني...' : 'Enter timestamp...'}
                  className="tool-input font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={unit === 'seconds' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('seconds')}
                >
                  {isAr ? 'ثوانٍ' : 'Seconds'}
                </Button>
                <Button
                  variant={unit === 'milliseconds' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('milliseconds')}
                >
                  {isAr ? 'ميلي ثانية' : 'Milliseconds'}
                </Button>
              </div>
              {convertedDate && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-sm text-muted-foreground">
                    {isAr ? 'التاريخ' : 'Date'}
                  </div>
                  <div className="text-lg font-semibold mt-1">{formatDate(convertedDate)}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    ISO: {convertedDate.toISOString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Date to Timestamp */}
        <TabsContent value="date2ts">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{isAr ? 'التاريخ والوقت' : 'Date & Time'}</Label>
                <Input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="tool-input font-mono"
                />
              </div>
              {convertedTs && (
                <div className="space-y-2">
                  <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {isAr ? 'ثوانٍ' : 'Seconds'}
                      </div>
                      <div className="text-lg font-mono font-semibold">{convertedTs.seconds}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(convertedTs.seconds.toString())}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {isAr ? 'ميلي ثانية' : 'Milliseconds'}
                      </div>
                      <div className="text-lg font-mono font-semibold">{convertedTs.milliseconds}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(convertedTs.milliseconds.toString())}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </CardContent>
    </Card>
  );
}
