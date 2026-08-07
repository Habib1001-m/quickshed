'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, KeyRound, ClipboardPaste } from 'lucide-react';
import { copyTextToClipboard, readTextFromClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'JWT Decoder',
    inputPlaceholder: 'Paste your JWT token here...',
    header: 'Header',
    payload: 'Payload',
    signature: 'Signature',
    copy: 'Copy',
    copied: 'Copied!',
    pasteFromClipboard: 'Paste from Clipboard',
    invalidJwt: 'Invalid JWT format. Must have 3 parts separated by dots.',
    expiration: 'Expiration',
    issuedAt: 'Issued At',
    notBefore: 'Not Before',
    expired: 'Expired',
    valid: 'Valid',
    notYetValid: 'Not yet valid',
    noExpiration: 'No expiration set',
    expiredOn: 'Expired on',
    expiresOn: 'Expires on',
    issuedOn: 'Issued on',
    timeAgo: 'ago',
    timeIn: 'in',
  },
  ar: {
    title: 'فك تشفير JWT',
    inputPlaceholder: 'الصق رمز JWT هنا...',
    header: 'الرأس',
    payload: 'الحمولة',
    signature: 'التوقيع',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    pasteFromClipboard: 'لصق من الحافظة',
    invalidJwt: 'صيغة JWT غير صالحة. يجب أن تتكون من 3 أجزاء مفصولة بنقاط.',
    expiration: 'انتهاء الصلاحية',
    issuedAt: 'تاريخ الإصدار',
    notBefore: 'غير صالح قبل',
    expired: 'منتهي الصلاحية',
    valid: 'صالح',
    notYetValid: 'غير صالح بعد',
    noExpiration: 'لا يوجد تاريخ انتهاء',
    expiredOn: 'انتهى في',
    expiresOn: 'ينتهي في',
    issuedOn: 'صدر في',
    timeAgo: 'منذ',
    timeIn: 'بعد',
  },
};

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return atob(base64);
  }
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

function timeFromNow(ts: number, locale: 'ar' | 'en'): string {
  const now = Date.now() / 1000;
  const diff = ts - now;
  const absDiff = Math.abs(diff);
  const prefix = diff > 0 ? labels[locale].timeIn : labels[locale].timeAgo;

  const days = Math.floor(absDiff / 86400);
  const hours = Math.floor((absDiff % 86400) / 3600);
  const mins = Math.floor((absDiff % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (parts.length === 0) parts.push('<1m');

  return `${prefix} ${parts.join(' ')}`;
}

function highlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span style="color:#e06c75">$1</span>:')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span style="color:#98c379">$1</span>')
    .replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span style="color:#d19a66">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span style="color:#56b6c2">$1</span>')
    .replace(/:\s*(null)/g, ': <span style="color:#c678dd">$1</span>');
}

/* ---------- section card ---------- */
function SectionCard({ title, json, t, onCopy, copied }: {
  title: string;
  json: string;
  t: typeof labels.en;
  onCopy: () => void;
  copied: boolean;
}) {
  const formatted = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }, [json]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
        </Button>
      </CardHeader>
      <CardContent>
        <pre
          className="tool-output text-sm font-mono whitespace-pre-wrap break-all bg-muted/50 rounded-md p-3 max-h-[300px] overflow-auto"
          dangerouslySetInnerHTML={{ __html: highlightJson(formatted) }}
        />
      </CardContent>
    </Card>
  );
}

/* ---------- main component ---------- */
export default function JwtDecoder({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const token = input.trim();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: t.invalidJwt };
    }

    try {
      const headerRaw = base64UrlDecode(parts[0]);
      const payloadRaw = base64UrlDecode(parts[1]);
      const headerObj = JSON.parse(headerRaw);
      const payloadObj = JSON.parse(payloadRaw);

      return {
        header: headerRaw,
        payload: payloadRaw,
        signature: parts[2],
        headerObj,
        payloadObj,
      };
    } catch {
      return { error: t.invalidJwt };
    }
  }, [input, t.invalidJwt]);

  const handlePaste = useCallback(async () => {
    const text = await readTextFromClipboard();
    if (text !== null) {
      setInput(text);
    }
  }, []);

  const handleCopySection = useCallback(async (section: string) => {
    setCopiedSection(null);
    if (await copyTextToClipboard(section)) {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } else {
      setCopiedSection(null);
    }
  }, []);

  const expStatus = useMemo(() => {
    if (!decoded || 'error' in decoded || !decoded.payloadObj) return null;
    const p = decoded.payloadObj as Record<string, unknown>;
    const nowSeconds = Date.now() / 1000;

    if (typeof p.exp === 'number') {
      const expired = p.exp < nowSeconds;
      return {
        type: expired ? 'expired' as const : 'valid' as const,
        time: formatTimestamp(p.exp),
        relative: timeFromNow(p.exp, locale),
      };
    }
    return { type: 'noExp' as const };
  }, [decoded, locale]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <KeyRound className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[120px] resize-y text-sm font-mono"
          />
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handlePaste}>
              <ClipboardPaste className="size-4 me-1" />
              {t.pasteFromClipboard}
            </Button>
          </div>
        </CardContent>
      </Card>

      {decoded && 'error' in decoded && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{decoded.error}</p>
          </CardContent>
        </Card>
      )}

      {decoded && !('error' in decoded) && (
        <>
          {/* Expiration status */}
          {expStatus && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3 items-center">
                  {expStatus.type === 'expired' && (
                    <Badge variant="destructive">{t.expired} — {t.expiredOn} {expStatus.time} ({expStatus.relative})</Badge>
                  )}
                  {expStatus.type === 'valid' && (
                    <Badge className="bg-emerald-600 text-white">{t.valid} — {t.expiresOn} {expStatus.time} ({expStatus.relative})</Badge>
                  )}
                  {expStatus.type === 'noExp' && (
                    <Badge variant="secondary">{t.noExpiration}</Badge>
                  )}

                  {typeof (decoded.payloadObj as Record<string, unknown>).iat === 'number' && (
                    <Badge variant="outline">
                      {t.issuedAt}: {formatTimestamp((decoded.payloadObj as Record<string, unknown>).iat as number)} ({timeFromNow((decoded.payloadObj as Record<string, unknown>).iat as number, locale)})
                    </Badge>
                  )}
                  {typeof (decoded.payloadObj as Record<string, unknown>).nbf === 'number' && (
                    <Badge variant="outline">
                      {t.notBefore}: {formatTimestamp((decoded.payloadObj as Record<string, unknown>).nbf as number)}
                      {(decoded.payloadObj as Record<string, unknown>).nbf as number > Date.now() / 1000 && ` (${t.notYetValid})`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <SectionCard
            title={t.header}
            json={decoded.header}
            t={t}
            onCopy={() => handleCopySection(decoded.header)}
            copied={copiedSection === decoded.header}
          />

          {/* Payload */}
          <SectionCard
            title={t.payload}
            json={decoded.payload}
            t={t}
            onCopy={() => handleCopySection(decoded.payload)}
            copied={copiedSection === decoded.payload}
          />

          {/* Signature */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">{t.signature}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleCopySection(decoded.signature)}>
                {copiedSection === decoded.signature ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedSection === decoded.signature ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono bg-muted/50 rounded-md p-3 break-all text-muted-foreground">{decoded.signature}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
