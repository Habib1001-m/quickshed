'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowLeftRight, ArrowRightLeft } from 'lucide-react';

const labels = {
  en: {
    title: 'Text Reverser',
    inputPlaceholder: 'Type or paste your text here...',
    outputPlaceholder: 'Reversed text will appear here...',
    reverseText: 'Reverse Text',
    reverseWords: 'Reverse Words',
    reverseEachWord: 'Reverse Each Word',
    copied: 'Copied!',
    copy: 'Copy',
  },
  ar: {
    title: 'عكس النص',
    inputPlaceholder: 'اكتب أو الصق النص هنا...',
    outputPlaceholder: 'سيظهر النص المعكوس هنا...',
    reverseText: 'عكس النص',
    reverseWords: 'عكس الكلمات',
    reverseEachWord: 'عكس كل كلمة',
    copied: 'تم النسخ!',
    copy: 'نسخ',
  },
};

type ReverseMode = 'text' | 'words' | 'eachWord';

export default function TextReverser({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ReverseMode>('text');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return '';
    switch (mode) {
      case 'text':
        return [...text].reverse().join('');
      case 'words':
        return text.split(/\s+/).reverse().join(' ');
      case 'eachWord':
        return text
          .split(/(\s+)/)
          .map((segment) => (segment.trim() ? [...segment].reverse().join('') : segment))
          .join('');
      default:
        return text;
    }
  }, [text, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeButtons: { key: ReverseMode; label: string; icon: typeof ArrowRightLeft }[] = [
    { key: 'text', label: t.reverseText, icon: ArrowRightLeft },
    { key: 'words', label: t.reverseWords, icon: ArrowLeftRight },
    { key: 'eachWord', label: t.reverseEachWord, icon: ArrowRightLeft },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ArrowRightLeft className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[160px] resize-y text-base"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {modeButtons.map((btn) => (
          <Button
            key={btn.key}
            variant={mode === btn.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode(btn.key)}
            className="flex items-center gap-2"
          >
            <btn.icon className="size-4" />
            {btn.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            {modeButtons.find((b) => b.key === mode)?.label}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!result}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result}
            readOnly
            placeholder={t.outputPlaceholder}
            className="tool-output min-h-[160px] resize-y text-base bg-muted/50"
          />
        </CardContent>
      </Card>
    </div>
  );
}
