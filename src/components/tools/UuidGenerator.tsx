'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Check, Fingerprint, Trash2 } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'UUID Generator',
    generate: 'Generate',
    uppercase: 'Uppercase',
    lowercase: 'Lowercase',
    withHyphens: 'With Hyphens',
    withoutHyphens: 'Without Hyphens',
    batch: 'Batch Generate',
    count: 'Count',
    copy: 'Copy',
    copyAll: 'Copy All',
    copied: 'Copied!',
    allCopied: 'All Copied!',
    clearAll: 'Clear All',
  },
  ar: {
    title: 'مولّد UUID',
    generate: 'توليد',
    uppercase: 'أحرف كبيرة',
    lowercase: 'أحرف صغيرة',
    withHyphens: 'مع واصلات',
    withoutHyphens: 'بدون واصلات',
    batch: 'توليد دفعي',
    count: 'العدد',
    copy: 'نسخ',
    copyAll: 'نسخ الكل',
    copied: 'تم النسخ!',
    allCopied: 'تم نسخ الكل!',
    clearAll: 'مسح الكل',
  },
};

function generateUUID(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    setCopied(false);
    if (await copyTextToClipboard(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };
  return (
    <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  );
}

export default function UuidGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [isUppercase, setIsUppercase] = useState(false);
  const [withHyphens, setWithHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [batchCount, setBatchCount] = useState(5);
  const [allCopied, setAllCopied] = useState(false);

  const formatUuid = useCallback((uuid: string) => {
    let result = withHyphens ? uuid : uuid.replace(/-/g, '');
    if (isUppercase) result = result.toUpperCase();
    return result;
  }, [withHyphens, isUppercase]);

  const handleGenerate = () => {
    const uuid = generateUUID();
    setUuids((prev) => [uuid, ...prev]);
  };

  const handleBatchGenerate = () => {
    const count = Math.max(1, Math.min(100, batchCount));
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids((prev) => [...newUuids, ...prev]);
  };

  const handleCopyAll = async () => {
    const text = uuids.map((u) => formatUuid(u)).join('\n');
    setAllCopied(false);
    if (await copyTextToClipboard(text)) {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } else {
      setAllCopied(false);
    }
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <Fingerprint className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="uuid-upper">{t.uppercase}</Label>
              <Switch id="uuid-upper" checked={isUppercase} onCheckedChange={setIsUppercase} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="uuid-hyphens">{t.withHyphens}</Label>
              <Switch id="uuid-hyphens" checked={withHyphens} onCheckedChange={setWithHyphens} />
            </div>
          </div>

          {/* Generate buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} className="tool-action-btn gap-2">
              <Fingerprint className="size-4" />
              {t.generate}
            </Button>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={batchCount}
                onChange={(e) => setBatchCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="tool-input w-20 text-center"
              />
              <Button onClick={handleBatchGenerate} variant="outline" className="gap-2">
                {t.batch}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UUID list */}
      {uuids.length > 0 && (
        <Card className="tool-wrapper-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              UUIDs ({uuids.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleCopyAll} variant="outline" size="sm" className="gap-1">
                {allCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                {allCopied ? t.allCopied : t.copyAll}
              </Button>
              <Button onClick={() => setUuids([])} variant="ghost" size="sm" className="gap-1 text-destructive">
                <Trash2 className="size-3" />
                {t.clearAll}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="max-h-96 overflow-y-auto space-y-1.5">
              {uuids.map((uuid, idx) => (
                <div key={idx} className="tool-output flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground w-6 shrink-0">{idx + 1}</span>
                  <code className="flex-1 text-sm font-mono break-all">{formatUuid(uuid)}</code>
                  <CopyBtn value={formatUuid(uuid)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
