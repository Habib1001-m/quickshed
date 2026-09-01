'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { normalizeUrlShortener, safeJsonParse, type ShortenedUrl } from '@/lib/storage-shapes';

const STORAGE_KEY = 'quickshed-url-shortener';
const ALIAS_RE = /^[A-Za-z0-9_-]{1,64}$/;
const RANDOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const labels = {
  en: {
    title: 'URL Shortener',
    inputLabel: 'Long URL',
    placeholder: 'https://example.com/very/long/url/that/needs/shortening',
    aliasLabel: 'Custom Alias (optional)',
    aliasPlaceholder: 'my-link',
    shorten: 'Shorten',
    copy: 'Copy',
    copied: 'Copied!',
    copyFailed: 'Could not copy to clipboard',
    delete: 'Delete',
    noUrls: 'No shortened URLs yet',
    storedLocally: 'Short links resolve only in this browser (stored locally)',
    openOriginal: 'Open original URL',
    invalidUrl: 'Please enter a valid URL',
    aliasTaken: 'This alias is already taken',
    invalidAlias: 'Alias must be alphanumeric, hyphens, or underscores',
    linkNotFound: 'Short link not found or unavailable in this browser',
    saveFailed: 'Could not save the link to this browser',
    clearAll: 'Clear All',
  },
  ar: {
    title: 'مختصر الروابط',
    inputLabel: 'الرابط الطويل',
    placeholder: 'https://example.com/very/long/url/that/needs/shortening',
    aliasLabel: 'اسم مخصص (اختياري)',
    aliasPlaceholder: 'my-link',
    shorten: 'تقصير',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    copyFailed: 'تعذّر النسخ إلى الحافظة',
    delete: 'حذف',
    noUrls: 'لا توجد روابط مختصرة بعد',
    storedLocally: 'الروابط تعمل في هذا المتصفح فقط (مخزنة محلياً)',
    openOriginal: 'فتح الرابط الأصلي',
    invalidUrl: 'يرجى إدخال رابط صالح',
    aliasTaken: 'هذا الاسم مستخدم بالفعل',
    invalidAlias: 'الاسم يجب أن يحتوي على أحرف إنجليزية وأرقام وواصلات (-) وشرطات سفلية (_) فقط',
    linkNotFound: 'الرابط غير موجود أو غير متاح في هذا المتصفح',
    saveFailed: 'تعذّر حفظ الرابط في هذا المتصفح',
    clearAll: 'مسح الكل',
  },
};

// Parse storage defensively via the shared shape normalizer: never trust
// malformed JSON or wrong shapes. The window guard keeps this client-safe.
function loadUrls(): ShortenedUrl[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeUrlShortener(safeJsonParse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return [];
  }
}

// Accept only http/https and reject credential-bearing URLs; rejects
// javascript:, data:, file:, user:pass@host, malformed, empty. Applies to
// both new submissions and stored targets resolved from the hash.
function safeHttpUrl(str: string): string | null {
  try {
    const u = new URL(str);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.username || u.password) return null;
    return u.href;
  } catch {
    return null;
  }
}

function randomAlias(): string {
  // ponytail: modulo bias over 256->62 is negligible for 8-char aliases;
  // revisit only if aliases ever become security-sensitive tokens.
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += RANDOM_ALPHABET[bytes[i] % RANDOM_ALPHABET.length];
  }
  return out;
}

export default function UrlShortener({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  // Always start empty so SSR and the client's first render match; valid
  // localStorage entries are loaded in a client effect below.
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [resolvedTarget, setResolvedTarget] = useState('');

  // Load valid localStorage entries on the client only (avoids hydration
  // mismatch; resolution stays same-browser/client-only). Deferred to a
  // timer so setUrls is not called synchronously in the effect body.
  useEffect(() => {
    const id = setTimeout(() => setUrls(loadUrls()), 0);
    return () => clearTimeout(id);
  }, []);

  // Resolve `#s/<alias>` on the client only and NEVER auto-navigate. A safe
  // stored target is surfaced as component state for an explicit CTA;
  // missing/unsafe (non-http(s) or credential-bearing) targets keep the
  // existing bilingual error.
  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (!raw.startsWith('s/')) {
        setResolveError('');
        setResolvedTarget('');
        return;
      }
      const hashAlias = raw.slice(2);
      const fail = labels[locale].linkNotFound;
      if (!ALIAS_RE.test(hashAlias)) {
        setResolveError(fail);
        setResolvedTarget('');
        return;
      }
      const stored = loadUrls().find((u) => u.alias === hashAlias);
      const target = stored ? safeHttpUrl(stored.original) : null;
      if (!target) {
        setResolveError(fail);
        setResolvedTarget('');
        return;
      }
      setResolveError('');
      setResolvedTarget(target);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [locale]);

  const persistUrls = useCallback((next: ShortenedUrl[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setUrls(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleShorten = () => {
    setError('');
    const trimmedUrl = longUrl.trim();
    const validated = safeHttpUrl(trimmedUrl);
    if (!validated) {
      setError(t.invalidUrl);
      return;
    }

    const customAlias = alias.trim();
    let shortAlias: string;
    if (customAlias) {
      if (!ALIAS_RE.test(customAlias)) {
        setError(t.invalidAlias);
        return;
      }
      if (urls.some((u) => u.alias === customAlias)) {
        setError(t.aliasTaken);
        return;
      }
      shortAlias = customAlias;
    } else {
      let candidate = randomAlias();
      let tries = 0;
      while (urls.some((u) => u.alias === candidate) && tries < 12) {
        candidate = randomAlias();
        tries++;
      }
      if (urls.some((u) => u.alias === candidate)) {
        setError(t.aliasTaken);
        return;
      }
      shortAlias = candidate;
    }

    const newUrl: ShortenedUrl = {
      alias: shortAlias,
      original: trimmedUrl,
      createdAt: new Date().toISOString(),
    };

    if (!persistUrls([newUrl, ...urls])) {
      setError(t.saveFailed);
      return;
    }
    setLongUrl('');
    setAlias('');
  };

  const handleDelete = (idx: number) => {
    persistUrls(urls.filter((_, i) => i !== idx));
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      setError(t.copyFailed);
    }
  };

  const getShortUrl = (a: string) =>
    `${window.location.origin}/${locale}/tools/url-shortener#s/${a}`;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {resolveError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{resolveError}</span>
        </div>
      )}
      {resolvedTarget && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4">
            <p className="break-all font-mono text-xs text-muted-foreground">{resolvedTarget}</p>
            <Button asChild className="tool-action-btn w-fit gap-2">
              <a href={resolvedTarget} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t.openOriginal}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Link className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.inputLabel}</Label>
            <Input
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder={t.placeholder}
              className="tool-input font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.aliasLabel}</Label>
            <Input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={t.aliasPlaceholder}
              className="tool-input"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleShorten} disabled={!longUrl.trim()} className="tool-action-btn gap-2">
            <Link className="size-4" />
            {t.shorten}
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5" />
            {t.storedLocally}
          </div>
        </CardContent>
      </Card>

      {/* URL list */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {urls.length} {isRTL ? 'رابط' : 'links'}
          </CardTitle>
          {urls.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => persistUrls([])} className="gap-1 text-destructive">
              <Trash2 className="size-3" />
              {t.clearAll}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noUrls}</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {urls.map((url, idx) => {
                const safeHref = safeHttpUrl(url.original);
                return (
                  <div key={url.alias} className="rounded-lg border p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold text-primary break-all">{getShortUrl(url.alias)}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        aria-label={t.copy}
                        onClick={() => handleCopy(getShortUrl(url.alias), idx)}
                      >
                        {copiedIdx === idx ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </Button>
                      {safeHref && (
                        <a href={safeHref} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <Button variant="ghost" size="icon" className="size-7" aria-label={t.openOriginal}>
                            <ExternalLink className="size-3" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-destructive"
                        aria-label={t.delete}
                        onClick={() => handleDelete(idx)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{url.original}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(url.createdAt).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
