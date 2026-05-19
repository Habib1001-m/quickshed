'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Link } from 'lucide-react';

const labels = {
  en: {
    title: 'Slug Generator',
    inputPlaceholder: 'Enter text to generate slug...',
    separator: 'Separator',
    lowercase: 'Lowercase',
    output: 'Slug',
    copied: 'Copied!',
    copy: 'Copy',
    dash: 'Dash (-)',
    underscore: 'Underscore (_)',
    dot: 'Dot (.)',
  },
  ar: {
    title: 'مولّد الرابط النظيف',
    inputPlaceholder: 'أدخل النص لتوليد الرابط النظيف...',
    separator: 'الفاصل',
    lowercase: 'أحرف صغيرة',
    output: 'الرابط النظيف',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    dash: 'شرطة (-)',
    underscore: 'شرطة سفلية (_)',
    dot: 'نقطة (.)',
  },
};

// Basic Arabic transliteration map
const ARABIC_MAP: Record<string, string> = {
  'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ئ': 'y', 'ؤ': 'o',
};

type Separator = '-' | '_' | '.';

function generateSlug(text: string, separator: Separator, lowercase: boolean): string {
  let slug = text;

  // Transliterate Arabic characters
  slug = [...slug].map((c) => ARABIC_MAP[c] || c).join('');

  // Remove accents (basic)
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace non-alphanumeric with separator
  slug = slug.replace(/[^a-zA-Z0-9]+/g, separator);

  // Remove leading/trailing separators
  slug = slug.replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '');

  // Remove duplicate separators
  slug = slug.replace(new RegExp(`\\${separator}{2,}`, 'g'), separator);

  if (lowercase) slug = slug.toLowerCase();

  return slug;
}

export default function SlugGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState<Separator>('-');
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    if (!text.trim()) return '';
    return generateSlug(text, separator, lowercase);
  }, [text, separator, lowercase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Link className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input text-base"
          />
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2 min-w-[160px]">
              <Label>{t.separator}</Label>
              <Select value={separator} onValueChange={(v) => setSeparator(v as Separator)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">{t.dash}</SelectItem>
                  <SelectItem value="_">{t.underscore}</SelectItem>
                  <SelectItem value=".">{t.dot}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
              <Label htmlFor="lowercase">{t.lowercase}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t.output}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!slug}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="tool-output rounded-md border bg-muted/50 p-4 text-lg font-mono break-all select-all min-h-[48px]">
            {slug || <span className="text-muted-foreground text-base">{t.inputPlaceholder}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
