'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Copy, Check, ArrowRightLeft } from 'lucide-react';

const labels = {
  en: {
    title: 'URL Encoder / Decoder',
    encode: 'Encode',
    decode: 'Decode',
    input: 'Input',
    output: 'Output',
    method: 'Method',
    encodeComponent: 'encodeURIComponent (query params)',
    encodeURI: 'encodeURI (full URLs)',
    decodeComponent: 'decodeURIComponent',
    decodeURI: 'decodeURI',
    copy: 'Copy',
    copied: 'Copied!',
    swap: 'Swap',
    error: 'Error decoding input',
  },
  ar: {
    title: 'مشفر / فاك تشفير URL',
    encode: 'تشفير',
    decode: 'فك التشفير',
    input: 'المدخل',
    output: 'المخرج',
    method: 'الطريقة',
    encodeComponent: 'encodeURIComponent (معاملات الاستعلام)',
    encodeURI: 'encodeURI (روابط كاملة)',
    decodeComponent: 'decodeURIComponent',
    decodeURI: 'decodeURI',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    swap: 'تبديل',
    error: 'خطأ في فك تشفير المدخل',
  },
};

export default function UrlEncoderDecoder({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [tab, setTab] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [method, setMethod] = useState('component');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return '';
    try {
      if (tab === 'encode') {
        if (method === 'component') return encodeURIComponent(input);
        return encodeURI(input);
      } else {
        if (method === 'component') return decodeURIComponent(input);
        return decodeURI(input);
      }
    } catch {
      return t.error;
    }
  }, [input, tab, method, t.error]);

  const methods = tab === 'encode'
    ? [
        { value: 'component', label: t.encodeComponent },
        { value: 'uri', label: t.encodeURI },
      ]
    : [
        { value: 'component', label: t.decodeComponent },
        { value: 'uri', label: t.decodeURI },
      ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  const handleSwap = () => {
    if (output && output !== t.error) {
      setInput(output);
      setTab(tab === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Link2 className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">{t.encode}</TabsTrigger>
              <TabsTrigger value="decode">{t.decode}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.method}</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {methods.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.input}</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.input}
              className="tool-input min-h-[120px] resize-y font-mono text-sm"
            />
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleSwap} className="flex items-center gap-2">
              <ArrowRightLeft className="size-4" />{t.swap}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t.output}</label>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output || output === t.error}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="tool-output min-h-[120px] resize-y font-mono text-sm bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
