'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Mic } from 'lucide-react';

const SPEEDS = {
  slow: { reading: 150, speaking: 100, label: 'Slow', labelAr: 'بطيء' },
  average: { reading: 250, speaking: 150, label: 'Average', labelAr: 'متوسط' },
  fast: { reading: 400, speaking: 200, label: 'Fast', labelAr: 'سريع' },
};

type Speed = keyof typeof SPEEDS;

export default function ReadingTimeCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState<number | ''>('');
  const [speed, setSpeed] = useState<Speed>('average');
  const [mode, setMode] = useState<'text' | 'count'>('text');

  const words = useMemo(() => {
    if (mode === 'text') {
      const trimmed = text.trim();
      return trimmed ? trimmed.split(/\s+/).length : 0;
    }
    return typeof wordCount === 'number' && wordCount > 0 ? wordCount : 0;
  }, [mode, text, wordCount]);

  const config = SPEEDS[speed];

  const readingMinutes = words / config.reading;
  const speakingMinutes = words / config.speaking;

  const formatTime = (minutes: number) => {
    if (minutes < 1) {
      const seconds = Math.ceil(minutes * 60);
      return isAr ? `${seconds} ثانية` : `${seconds} sec`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = Math.ceil(minutes % 60);
    if (hrs > 0) {
      return isAr ? `${hrs} ساعة ${mins} دقيقة` : `${hrs}h ${mins}m`;
    }
    return isAr ? `${Math.ceil(minutes)} دقيقة` : `${Math.ceil(minutes)} min`;
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'حاسبة وقت القراءة' : 'Reading Time Calculator'}
        </h2>
      </div>

      {/* Mode & Speed */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setMode('text')}
          >
            {isAr ? 'نص' : 'Text'}
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'count' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setMode('count')}
          >
            {isAr ? 'عدد الكلمات' : 'Word Count'}
          </button>
        </div>
        <Select value={speed} onValueChange={(v) => setSpeed(v as Speed)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SPEEDS).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {isAr ? val.labelAr : val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Input */}
      {mode === 'text' ? (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isAr ? 'الصق النص هنا...' : 'Paste your text here...'}
          className="tool-input min-h-[200px] text-sm leading-relaxed"
        />
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1.5">
              <Label>{isAr ? 'عدد الكلمات' : 'Word Count'}</Label>
              <Input
                type="number"
                min={1}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || '')}
                placeholder={isAr ? 'أدخل عدد الكلمات' : 'Enter word count'}
                className="tool-input font-mono"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {words > 0 && (
        <div className="tool-output grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-sky-200 dark:border-sky-900">
            <CardContent className="pt-4 flex items-center gap-3">
              <BookOpen className="size-8 text-sky-500 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">
                  {isAr ? 'وقت القراءة' : 'Reading Time'}
                </div>
                <div className="text-2xl font-bold">{formatTime(readingMinutes)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {config.reading} {isAr ? 'كلمة/دقيقة' : 'wpm'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900">
            <CardContent className="pt-4 flex items-center gap-3">
              <Mic className="size-8 text-amber-500 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">
                  {isAr ? 'وقت التحدث' : 'Speaking Time'}
                </div>
                <div className="text-2xl font-bold">{formatTime(speakingMinutes)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {config.speaking} {isAr ? 'كلمة/دقيقة' : 'wpm'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {words > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {isAr ? 'عدد الكلمات' : 'Word Count'}
              </div>
              <div className="text-2xl font-bold">{words.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
