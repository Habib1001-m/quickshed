'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Target } from 'lucide-react';

export default function EssayWordCounter({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [text, setText] = useState('');
  const [goal, setGoal] = useState(500);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const sentences = trimmed ? trimmed.split(/[.!?؟。]+/).filter((s) => s.trim()).length : 0;
    const pages = Math.max(0, Math.ceil(words / 250));
    const readingTimeMin = Math.ceil(words / 200);
    const progressPct = goal > 0 ? Math.min(100, (words / goal) * 100) : 0;

    return { words, characters, charactersNoSpaces, paragraphs, sentences, pages, readingTimeMin, progressPct };
  }, [text, goal]);

  const statItems = [
    { label: isAr ? 'كلمات' : 'Words', value: stats.words },
    { label: isAr ? 'أحرف' : 'Characters', value: stats.characters },
    { label: isAr ? 'أحرف (بدون مسافات)' : 'Chars (no spaces)', value: stats.charactersNoSpaces },
    { label: isAr ? 'فقرات' : 'Paragraphs', value: stats.paragraphs },
    { label: isAr ? 'جمل' : 'Sentences', value: stats.sentences },
    { label: isAr ? 'صفحات' : 'Pages', value: stats.pages, sub: '(250 w/p)' },
    { label: isAr ? 'وقت القراءة' : 'Reading Time', value: `${stats.readingTimeMin} min`, sub: '(200 wpm)' },
  ];

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'عداد كلمات المقال' : 'Essay Word Counter'}
        </h2>
      </div>

      {/* Goal */}
      <Card className="tool-wrapper-card">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Target className="size-5 text-amber-500 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{isAr ? 'هدف الكلمات' : 'Word Goal'}</Label>
                <Badge variant={stats.progressPct >= 100 ? 'default' : 'secondary'} className="text-xs">
                  {stats.progressPct >= 100
                    ? isAr ? 'تم التحقيق!' : 'Goal reached!'
                    : `${Math.round(stats.progressPct)}%`}
                </Badge>
              </div>
              <Progress value={stats.progressPct} className="h-2" />
              <Input
                type="number"
                min={1}
                value={goal}
                onChange={(e) => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
                className="tool-input w-24 text-center font-mono text-sm h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Textarea */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isAr ? 'اكتب أو الصق مقالك هنا...' : 'Type or paste your essay here...'}
        className="tool-input min-h-[200px] sm:min-h-[300px] font-serif text-sm leading-relaxed"
      />

      {/* Stats */}
      <div className="tool-output grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statItems.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
              {s.sub && <div className="text-[9px] text-muted-foreground/60">{s.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
