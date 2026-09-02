'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, BookOpen } from 'lucide-react';

const labels = {
  en: {
    title: 'Lorem Ipsum Generator',
    type: 'Type',
    count: 'Count',
    generate: 'Generate',
    copied: 'Copied!',
    copy: 'Copy',
    paragraphs: 'Paragraphs',
    sentences: 'Sentences',
    words: 'Words',
    latin: 'Latin',
    arabic: 'Arabic',
    language: 'Language',
    placeholder: 'Click Generate to create lorem ipsum text...',
    output: 'Output',
  },
  ar: {
    title: 'مولّد لوريم إيبسوم',
    type: 'النوع',
    count: 'العدد',
    generate: 'توليد',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    paragraphs: 'فقرات',
    sentences: 'جمل',
    words: 'كلمات',
    latin: 'لاتيني',
    arabic: 'عربي',
    language: 'اللغة',
    placeholder: 'اضغط توليد لإنشاء نص لوريم إيبسوم...',
    output: 'المخرجات',
  },
};

const LATIN_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
];

const ARABIC_WORDS = [
  'هذا', 'نص', 'تجريبي', 'يمكن', 'أن', 'يستبدل', 'بنص', 'آخر', 'في', 'المستقبل',
  'القادم', 'هناك', 'العديد', 'من', 'التنويعات', 'المتاحة', 'لنصوص', 'لكن',
  'الأغلب', 'عانى', 'تغيير', 'شكل', 'ما', 'إلى', 'بعض', 'التعديلات', 'عليه',
  'كان', 'لوريم', 'إيبسوم', 'هو', 'ببساطة', 'شكلي', 'يستخدم', 'في', 'الطباعة',
  'والتنسيق', 'صناعة', 'تحتاج', 'محتوى', 'واقعي', 'لعرض', 'العمل', 'التصميم',
  'إذا', 'كنت', 'تريد', 'استخدام', 'فإنك', 'تحتاج', 'التأكد', 'أنه', 'لا',
  'يحتوي', 'أي', 'كلمات', 'محرجة', 'أو', 'غير', 'لائقة', 'بين', 'النصوص',
  'المخفية', 'المواقع', 'الإلكترونية', 'تستخدم', 'مولدات', 'نصوص', 'افتراضية',
];

function randomWord(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

function generateSentence(words: string[], minLen = 6, maxLen = 14): string {
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  const sentence = Array.from({ length: len }, () => randomWord(words));
  sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
  return sentence.join(' ') + '.';
}

function generateParagraph(words: string[], minSent = 3, maxSent = 7): string {
  const count = minSent + Math.floor(Math.random() * (maxSent - minSent + 1));
  return Array.from({ length: count }, () => generateSentence(words)).join(' ');
}

type GenType = 'paragraphs' | 'sentences' | 'words';
type GenLang = 'latin' | 'arabic';

export default function LoremIpsumGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [genType, setGenType] = useState<GenType>('paragraphs');
  const [count, setCount] = useState(3);
  const [language, setLanguage] = useState<GenLang>('latin');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const words = language === 'latin' ? LATIN_WORDS : ARABIC_WORDS;
    let result = '';

    switch (genType) {
      case 'paragraphs':
        result = Array.from({ length: count }, () => generateParagraph(words)).join('\n\n');
        break;
      case 'sentences':
        result = Array.from({ length: count }, () => generateSentence(words)).join(' ');
        break;
      case 'words':
        result = Array.from({ length: count }, () => randomWord(words)).join(' ');
        break;
    }

    setOutput(result);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <BookOpen className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.type}</Label>
              <Select value={genType} onValueChange={(v) => setGenType(v as GenType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraphs">{t.paragraphs}</SelectItem>
                  <SelectItem value="sentences">{t.sentences}</SelectItem>
                  <SelectItem value="words">{t.words}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.count}</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="tool-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.language}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as GenLang)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latin">{t.latin}</SelectItem>
                  <SelectItem value="arabic">{t.arabic}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} className="tool-action-btn w-full sm:w-auto">
            {t.generate}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t.output}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            readOnly
            placeholder={t.placeholder}
            className="tool-output min-h-[200px] resize-y text-base bg-muted/50"
          />
        </CardContent>
      </Card>
    </div>
  );
}
