'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Binary } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'Text to Binary',
    textToBinary: 'Text → Binary',
    binaryToText: 'Binary → Text',
    inputLabel: 'Input',
    outputLabel: 'Output',
    placeholder: 'Type or paste text...',
    binaryPlaceholder: 'Enter binary (e.g. 01001000)',
    spaceSeparated: 'Space separated',
    copy: 'Copy',
    copied: 'Copied!',
    invalidBinary: 'Invalid binary input. Use only 0 and 1.',
  },
  ar: {
    title: 'نص إلى ثنائي',
    textToBinary: 'نص ← ثنائي',
    binaryToText: 'ثنائي ← نص',
    inputLabel: 'المدخل',
    outputLabel: 'الناتج',
    placeholder: 'اكتب أو الصق النص...',
    binaryPlaceholder: 'أدخل ثنائياً (مثال 01001000)',
    spaceSeparated: 'مفصولة بمسافات',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    invalidBinary: 'مدخل ثنائي غير صالح. استخدم 0 و 1 فقط.',
  },
};

function textToBinary(text: string, spaceSeparated: boolean): string {
  const binary = [...text].map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'));
  return binary.join(spaceSeparated ? ' ' : '');
}

function binaryToText(binary: string): string | null {
  const cleaned = binary.replace(/\s/g, '');
  if (!/^[01]+$/.test(cleaned)) return null;
  if (cleaned.length % 8 !== 0) return null;
  let result = '';
  for (let i = 0; i < cleaned.length; i += 8) {
    const byte = cleaned.substring(i, i + 8);
    result += String.fromCharCode(parseInt(byte, 2));
  }
  return result;
}

export default function TextToBinary({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [mode, setMode] = useState('toBinary');
  const [input, setInput] = useState('');
  const [spaceSeparated, setSpaceSeparated] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    if (mode === 'toBinary') {
      return textToBinary(input, spaceSeparated);
    } else {
      const result = binaryToText(input);
      return result ?? '';
    }
  }, [input, mode, spaceSeparated]);

  const isValid = mode === 'toBinary' || !input.trim() || binaryToText(input) !== null;

  const handleCopy = async () => {
    setCopied(false);
    if (await copyTextToClipboard(output)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Binary className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="toBinary">{t.textToBinary}</TabsTrigger>
              <TabsTrigger value="toText">{t.binaryToText}</TabsTrigger>
            </TabsList>

            <TabsContent value="toBinary" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t.inputLabel}</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="tool-input min-h-[120px] resize-y font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer" htmlFor="tb-space">{t.spaceSeparated}</Label>
                <Switch id="tb-space" checked={spaceSeparated} onCheckedChange={setSpaceSeparated} />
              </div>
            </TabsContent>

            <TabsContent value="toText" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t.inputLabel}</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.binaryPlaceholder}
                  className="tool-input min-h-[120px] resize-y font-mono text-sm"
                />
              </div>
              {!isValid && input.trim() && (
                <p className="text-sm text-destructive">{t.invalidBinary}</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t.outputLabel}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              className="tool-output min-h-[120px] resize-y font-mono text-sm bg-muted/50 break-all"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
