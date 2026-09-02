'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, Fingerprint, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';

const labels = {
  en: {
    title: 'UUID Generator',
    generate: 'Generate',
    version: 'UUID Version',
    v1: 'v1 (Timestamp)',
    v4: 'v4 (Random)',
    v5: 'v5 (SHA-1 Namespace)',
    bulkCount: 'Bulk Count',
    formatOptions: 'Format Options',
    uppercase: 'Uppercase',
    noHyphens: 'No Hyphens',
    braces: 'Braces { }',
    copy: 'Copy',
    copied: 'Copied!',
    copyAll: 'Copy All',
    validate: 'Validate UUID',
    validateInput: 'Enter UUID to validate...',
    validUuid: 'Valid UUID',
    invalidUuid: 'Invalid UUID',
    namespace: 'Namespace',
    namespaceDns: 'DNS',
    namespaceUrl: 'URL',
    namespaceOid: 'OID',
    namespaceX500: 'X.500',
    name: 'Name (for v5)',
  },
  ar: {
    title: 'مولد UUID',
    generate: 'توليد',
    version: 'إصدار UUID',
    v1: 'v1 (طابع زمني)',
    v4: 'v4 (عشوائي)',
    v5: 'v5 (SHA-1 مساحة الاسم)',
    bulkCount: 'عدد التوليد',
    formatOptions: 'خيارات التنسيق',
    uppercase: 'أحرف كبيرة',
    noHyphens: 'بدون واصلات',
    braces: 'أقواس { }',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    copyAll: 'نسخ الكل',
    validate: 'التحقق من UUID',
    validateInput: 'أدخل UUID للتحقق...',
    validUuid: 'UUID صالح',
    invalidUuid: 'UUID غير صالح',
    namespace: 'مساحة الاسم',
    namespaceDns: 'DNS',
    namespaceUrl: 'URL',
    namespaceOid: 'OID',
    namespaceX500: 'X.500',
    name: 'الاسم (لـ v5)',
  },
};

const NAMESPACE_UUIDS: Record<string, string> = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

/* ---------- UUID generators ---------- */
function uuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function uuidV1(): string {
  const now = Date.now();
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHi = ((now >> 48) & 0x0fff | 0x1000).toString(16).padStart(4, '0');
  const clockSeq = (Math.random() * 0x3fff | 0x8000).toString(16).padStart(4, '0');
  const node = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('');
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
}

/* Simple SHA-1 for UUID v5 using Web Crypto */
async function sha1Digest(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-1', data.buffer as ArrayBuffer);
  return new Uint8Array(hash);
}

function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

async function uuidV5(namespace: string, name: string): Promise<string> {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(nsBytes.length + nameBytes.length);
  data.set(nsBytes);
  data.set(nameBytes, nsBytes.length);
  const hash = await sha1Digest(data);
  // Set version (5) and variant
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  return bytesToUuid(hash.slice(0, 16));
}

function formatUuid(uuid: string, options: { uppercase: boolean; noHyphens: boolean; braces: boolean }): string {
  let result = uuid;
  if (options.noHyphens) result = result.replace(/-/g, '');
  if (options.uppercase) result = result.toUpperCase();
  if (options.braces) result = `{${result}}`;
  return result;
}

function isValidUUID(str: string): boolean {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return pattern.test(str) || pattern.test(str.replace(/[{}]/g, ''));
}

/* ---------- main component ---------- */
export default function UuidGeneratorDev({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [version, setVersion] = useState<'v1' | 'v4' | 'v5'>('v4');
  const [bulkCount, setBulkCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [braces, setBraces] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [validateInput, setValidateInput] = useState('');
  const [namespaceType, setNamespaceType] = useState('dns');
  const [v5Name, setV5Name] = useState('example.com');
  const [generating, setGenerating] = useState(false);

  const formatOptions = useMemo(() => ({ uppercase, noHyphens, braces }), [uppercase, noHyphens, braces]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    const count = Math.min(Math.max(bulkCount, 1), 1000);
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      let uuid: string;
      if (version === 'v4') {
        uuid = uuidV4();
      } else if (version === 'v1') {
        uuid = uuidV1();
      } else {
        uuid = await uuidV5(NAMESPACE_UUIDS[namespaceType] || NAMESPACE_UUIDS.dns, v5Name || 'default');
      }
      results.push(formatUuid(uuid, formatOptions));
    }

    setUuids(results);
    setGenerating(false);
  }, [version, bulkCount, formatOptions, namespaceType, v5Name]);

  const handleCopyOne = useCallback(async (idx: number) => {
    try {
      await navigator.clipboard.writeText(uuids[idx]);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // No false positive success.
    }
  }, [uuids]);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // No false positive success.
    }
  }, [uuids]);

  const validationResult = useMemo(() => {
    if (!validateInput.trim()) return null;
    return isValidUUID(validateInput.trim().replace(/[{}]/g, ''));
  }, [validateInput]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Fingerprint className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Version */}
          <div>
            <Label className="mb-2 block">{t.version}</Label>
            <div className="flex gap-2">
              {(['v1', 'v4', 'v5'] as const).map((v) => (
                <Button
                  key={v}
                  variant={version === v ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVersion(v)}
                >
                  {t[`v${v.slice(1)}` as keyof typeof t] || v}
                </Button>
              ))}
            </div>
          </div>

          {/* V5 options */}
          {version === 'v5' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">{t.namespace}</Label>
                <Select value={namespaceType} onValueChange={setNamespaceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dns">{t.namespaceDns}</SelectItem>
                    <SelectItem value="url">{t.namespaceUrl}</SelectItem>
                    <SelectItem value="oid">{t.namespaceOid}</SelectItem>
                    <SelectItem value="x500">{t.namespaceX500}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">{t.name}</Label>
                <Input value={v5Name} onChange={(e) => setV5Name(e.target.value)} placeholder="example.com" className="tool-input font-mono" />
              </div>
            </div>
          )}

          {/* Bulk count */}
          <div>
            <Label className="mb-2 block">{t.bulkCount} (1-1000)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={bulkCount}
              onChange={(e) => setBulkCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
              className="tool-input w-32"
            />
          </div>

          {/* Format options */}
          <div>
            <Label className="mb-2 block">{t.formatOptions}</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={uppercase} onCheckedChange={setUppercase} />
                <Label className="text-sm">{t.uppercase}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={noHyphens} onCheckedChange={setNoHyphens} />
                <Label className="text-sm">{t.noHyphens}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={braces} onCheckedChange={setBraces} />
                <Label className="text-sm">{t.braces}</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="tool-action-btn">
            <RefreshCw className={`size-4 me-1 ${generating ? 'animate-spin' : ''}`} />
            {t.generate}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {uuids.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">
              {uuids.length} UUID{uuids.length > 1 ? 's' : ''}
            </CardTitle>
            {uuids.length > 1 && (
              <Button variant="ghost" size="sm" onClick={handleCopyAll}>
                {copiedAll ? <Check className="size-4 me-1" /> : <Copy className="size-4 me-1" />}
                {copiedAll ? <span className="copy-feedback">{t.copied}</span> : t.copyAll}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="tool-output space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                  <code className="text-sm font-mono flex-1 break-all">{uuid}</code>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyOne(i)} className="shrink-0">
                    {copiedIdx === i ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4" />
            {t.validate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={validateInput}
            onChange={(e) => setValidateInput(e.target.value)}
            placeholder={t.validateInput}
            className="tool-input font-mono"
          />
          {validationResult !== null && (
            <div className="mt-2">
              {validationResult ? (
                <Badge className="bg-emerald-600 text-white">{t.validUuid}</Badge>
              ) : (
                <Badge variant="destructive"><XCircle className="size-3 me-1" />{t.invalidUuid}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
