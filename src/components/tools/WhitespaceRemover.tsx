'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Check, Space } from 'lucide-react';

const labels = {
  en: {
    title: 'Whitespace Remover',
    inputLabel: 'Input Text',
    inputPlaceholder: 'Paste your text here...',
    outputLabel: 'Result',
    trimLeading: 'Remove leading/trailing whitespace',
    removeExtra: 'Remove extra spaces',
    removeAll: 'Remove all spaces',
    removeLineBreaks: 'Remove line breaks',
    removeTabs: 'Remove tabs',
    copy: 'Copy',
    copied: 'Copied!',
    charCount: 'Characters',
    before: 'Before',
    after: 'After',
  },
  ar: {
    title: 'مزيل المسافات',
    inputLabel: 'النص المدخل',
    inputPlaceholder: 'الصق النص هنا...',
    outputLabel: 'النتيجة',
    trimLeading: 'إزالة المسافات البادئة واللاحقة',
    removeExtra: 'إزالة المسافات الزائدة',
    removeAll: 'إزالة كل المسافات',
    removeLineBreaks: 'إزالة فواصل الأسطر',
    removeTabs: 'إزالة الجداول',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    charCount: 'الأحرف',
    before: 'قبل',
    after: 'بعد',
  },
};

export default function WhitespaceRemover({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [input, setInput] = useState('');
  const [trimLeading, setTrimLeading] = useState(true);
  const [removeExtra, setRemoveExtra] = useState(false);
  const [removeAll, setRemoveAll] = useState(false);
  const [removeLineBreaks, setRemoveLineBreaks] = useState(false);
  const [removeTabs, setRemoveTabs] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    let result = input;

    if (removeTabs) {
      result = result.replace(/\t/g, ' ');
    }

    if (removeLineBreaks) {
      result = result.replace(/\r?\n/g, ' ');
    }

    if (removeAll) {
      result = result.replace(/ /g, '');
    } else if (removeExtra) {
      result = result.replace(/ {2,}/g, ' ');
    }

    if (trimLeading) {
      result = result
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
      result = result.trim();
    }

    return result;
  }, [input, trimLeading, removeExtra, removeAll, removeLineBreaks, removeTabs]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  const beforeCount = input.length;
  const afterCount = output.length;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Space className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="ws-trim">{t.trimLeading}</Label>
              <Switch id="ws-trim" checked={trimLeading} onCheckedChange={setTrimLeading} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="ws-extra">{t.removeExtra}</Label>
              <Switch id="ws-extra" checked={removeExtra} onCheckedChange={setRemoveExtra} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="ws-all">{t.removeAll}</Label>
              <Switch id="ws-all" checked={removeAll} onCheckedChange={setRemoveAll} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="ws-breaks">{t.removeLineBreaks}</Label>
              <Switch id="ws-breaks" checked={removeLineBreaks} onCheckedChange={setRemoveLineBreaks} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="ws-tabs">{t.removeTabs}</Label>
              <Switch id="ws-tabs" checked={removeTabs} onCheckedChange={setRemoveTabs} />
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label>{t.inputLabel}</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="tool-input min-h-[150px] resize-y font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t.outputLabel}</CardTitle>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="gap-1">
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={output}
            readOnly
            className="tool-output min-h-[150px] resize-y font-mono text-sm bg-muted/50"
          />

          {/* Character counts */}
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              {t.before}: <span className="font-semibold text-foreground">{beforeCount}</span> {t.charCount}
            </span>
            <span className="text-muted-foreground">
              {t.after}: <span className="font-semibold text-primary">{afterCount}</span> {t.charCount}
            </span>
            {beforeCount > 0 && (
              <span className="text-emerald-600">
                -{beforeCount - afterCount}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
