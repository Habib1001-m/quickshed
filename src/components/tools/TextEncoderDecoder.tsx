'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Check, Lock } from 'lucide-react';
import {
  decodeBase64Unicode,
  decodeHtmlEntities,
  encodeBase64Unicode,
} from '@/lib/text-codecs';

const labels = {
  en: {
    title: 'Text Encoder / Decoder',
    encode: 'Encode',
    decode: 'Decode',
    mode: 'Mode',
    inputPlaceholder: 'Enter text to encode/decode...',
    outputPlaceholder: 'Result will appear here...',
    urlEncoding: 'URL Encoding',
    htmlEntities: 'HTML Entities',
    base64: 'Base64',
    copied: 'Copied!',
    copy: 'Copy',
    invalidInput: 'Invalid input for decoding',
    encodingType: 'Encoding Type',
  },
  ar: {
    title: 'ترميز / فك ترميز النص',
    encode: 'ترميز',
    decode: 'فك الترميز',
    mode: 'الوضع',
    inputPlaceholder: 'أدخل النص للترميز/فك الترميز...',
    outputPlaceholder: 'ستظهر النتيجة هنا...',
    urlEncoding: 'ترميز URL',
    htmlEntities: 'كيانات HTML',
    base64: 'Base64',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    invalidInput: 'إدخال غير صالح لفك الترميز',
    encodingType: 'نوع الترميز',
  },
};

type Direction = 'encode' | 'decode';
type EncodingType = 'url' | 'html' | 'base64';

function encodeText(text: string, type: EncodingType): string {
  switch (type) {
    case 'url':
      return encodeURIComponent(text);
    case 'html':
      return text.replace(/[&<>"']/g, (c) => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        };
        return map[c];
      });
    case 'base64':
      return encodeBase64Unicode(text);
  }
}

function decodeText(text: string, type: EncodingType): string {
  switch (type) {
    case 'url':
      try {
        return decodeURIComponent(text);
      } catch {
        return '';
      }
    case 'html':
      return decodeHtmlEntities(text);
    case 'base64':
      return decodeBase64Unicode(text) ?? '';
  }
}

export default function TextEncoderDecoder({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [direction, setDirection] = useState<Direction>('encode');
  const [encodingType, setEncodingType] = useState<EncodingType>('url');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return '';
    const result = direction === 'encode'
      ? encodeText(input, encodingType)
      : decodeText(input, encodingType);
    return result || t.invalidInput;
  }, [input, direction, encodingType, t.invalidInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Lock className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">{t.mode}</Label>
              <Tabs value={direction} onValueChange={(v) => setDirection(v as Direction)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encode">{t.encode}</TabsTrigger>
                  <TabsTrigger value="decode">{t.decode}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <Label className="mb-2 block">{t.encodingType}</Label>
              <Select value={encodingType} onValueChange={(v) => setEncodingType(v as EncodingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">{t.urlEncoding}</SelectItem>
                  <SelectItem value="html">{t.htmlEntities}</SelectItem>
                  <SelectItem value="base64">{t.base64}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[160px] resize-y text-base font-mono"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            {direction === 'encode' ? t.encode : t.decode}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output || output === t.invalidInput}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            readOnly
            placeholder={t.outputPlaceholder}
            className="tool-output min-h-[160px] resize-y text-base font-mono bg-muted/50"
          />
        </CardContent>
      </Card>
    </div>
  );
}
