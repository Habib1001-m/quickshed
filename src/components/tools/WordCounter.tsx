'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

const labels = {
  en: {
    title: 'Word Counter',
    placeholder: 'Type or paste your text here...',
    characters: 'Characters',
    charNoSpaces: 'Characters (no spaces)',
    words: 'Words',
    sentences: 'Sentences',
    paragraphs: 'Paragraphs',
    readingTime: 'Reading Time',
    topKeywords: 'Top Keywords',
    copied: 'Copied!',
    copy: 'Copy text',
    min: 'min',
    sec: 'sec',
    noKeywords: 'Start typing to see keyword frequency',
  },
  ar: {
    title: 'عداد الكلمات',
    placeholder: 'اكتب أو الصق النص هنا...',
    characters: 'الأحرف',
    charNoSpaces: 'أحرف بدون مسافات',
    words: 'الكلمات',
    sentences: 'الجمل',
    paragraphs: 'الفقرات',
    readingTime: 'وقت القراءة',
    topKeywords: 'أكثر الكلمات تكراراً',
    copied: 'تم النسخ!',
    copy: 'نسخ النص',
    min: 'دقيقة',
    sec: 'ثانية',
    noKeywords: 'ابدأ الكتابة لرؤية تكرار الكلمات',
  },
};

export default function WordCounter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const characters = text.length;
    const charNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?؟。]+/).filter((s) => s.trim().length > 0).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
    const readingTimeMin = words / 200;
    const readingTime =
      readingTimeMin < 1
        ? `${Math.max(1, Math.ceil(readingTimeMin * 60))} ${t.sec}`
        : `${Math.ceil(readingTimeMin)} ${t.min}`;

    return { characters, charNoSpaces, words, sentences, paragraphs, readingTime };
  }, [text, t.min, t.sec]);

  const keywords = useMemo(() => {
    if (!text.trim()) return [];
    const wordMap = new Map<string, number>();
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
      'should', 'may', 'might', 'can', 'could', 'must', 'and', 'but', 'or',
      'nor', 'for', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'it', 'its',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their',
      'لا', 'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك',
      'تلك', 'هو', 'هي', 'أنا', 'أنت', 'نحن', 'هم', 'كان', 'كانت',
    ]);
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w))
      .forEach((w) => wordMap.set(w, (wordMap.get(w) || 0) + 1));

    return Array.from(wordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  const statItems = [
    { label: t.characters, value: stats.characters },
    { label: t.charNoSpaces, value: stats.charNoSpaces },
    { label: t.words, value: stats.words },
    { label: t.sentences, value: stats.sentences },
    { label: t.paragraphs, value: stats.paragraphs },
    { label: t.readingTime, value: stats.readingTime },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="tool-section-title">
            <Type className="size-5" />
            {t.title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text}>
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            className="tool-input min-h-[200px] resize-y text-base"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statItems.map((stat) => (
          <Card key={stat.label} className="tool-wrapper-card text-center">
            <CardContent className="p-4">
              <div className="hero-stat-number">{stat.value}</div>
              <div className="hero-stat-label">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.topKeywords}</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noKeywords}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map(([word, count]) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {word}
                  <span className="rounded-full bg-primary/20 px-1.5 text-xs">{count}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
