'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check, CaseSensitive } from 'lucide-react';

const labels = {
  en: {
    title: 'Case Converter',
    inputPlaceholder: 'Type or paste your text here...',
    outputPlaceholder: 'Converted text will appear here...',
    upper: 'UPPERCASE',
    lower: 'lowercase',
    titleCase: 'Title Case',
    sentence: 'Sentence case',
    camel: 'camelCase',
    snake: 'snake_case',
    kebab: 'kebab-case',
    pascal: 'PascalCase',
    copied: 'Copied!',
    copy: 'Copy',
  },
  ar: {
    title: 'محول الحالة',
    inputPlaceholder: 'اكتب أو الصق النص هنا...',
    outputPlaceholder: 'سيظهر النص المحول هنا...',
    upper: 'أحرف كبيرة',
    lower: 'أحرف صغيرة',
    titleCase: 'حالة العنوان',
    sentence: 'حالة الجملة',
    camel: 'حالة الجمل',
    snake: 'حالة الثعبان',
    kebab: 'حالة الشرطة',
    pascal: 'حالة باشال',
    copied: 'تم النسخ!',
    copy: 'نسخ',
  },
};

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-')
    .replace(/([A-Z])/g, '-$1')
    .replace(/^-/, '')
    .toLowerCase();
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.replace(/^(.)/, (_, c) => c.toUpperCase());
}

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab' | 'pascal';

const converters: Record<CaseType, (s: string) => string> = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: toTitleCase,
  sentence: toSentenceCase,
  camel: toCamelCase,
  snake: toSnakeCase,
  kebab: toKebabCase,
  pascal: toPascalCase,
};

export default function CaseConverter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('upper');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return '';
    return converters[caseType](text);
  }, [text, caseType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons: { key: CaseType; label: string }[] = [
    { key: 'upper', label: t.upper },
    { key: 'lower', label: t.lower },
    { key: 'title', label: t.titleCase },
    { key: 'sentence', label: t.sentence },
    { key: 'camel', label: t.camel },
    { key: 'snake', label: t.snake },
    { key: 'kebab', label: t.kebab },
    { key: 'pascal', label: t.pascal },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <CaseSensitive className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[160px] resize-y text-base"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <Button
            key={btn.key}
            variant={caseType === btn.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCaseType(btn.key)}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      <Card className="tool-wrapper-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            {buttons.find((b) => b.key === caseType)?.label}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!result}>
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Textarea
            value={result}
            readOnly
            placeholder={t.outputPlaceholder}
            className="tool-output min-h-[160px] resize-y text-base"
          />
        </CardContent>
      </Card>
    </div>
  );
}
