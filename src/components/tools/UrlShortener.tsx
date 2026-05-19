'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

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
    delete: 'Delete',
    noUrls: 'No shortened URLs yet',
    storedLocally: 'Links are stored locally in your browser',
    invalidUrl: 'Please enter a valid URL',
    aliasTaken: 'This alias is already taken',
    invalidAlias: 'Alias must be alphanumeric, hyphens, or underscores',
    clearAll: 'Clear All',
  },
  ar: {
    title: 'مختصر الروابط',
    inputLabel: 'الرابط الطويل',
    placeholder: 'https://example.com/very/long/url/that/needs/shortening',
    aliasLabel: 'اسم مخصص (اختياري)',
    aliasPlaceholder: 'رابطي',
    shorten: 'تقصير',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    delete: 'حذف',
    noUrls: 'لا توجد روابط مختصرة بعد',
    storedLocally: 'الروابط مخزنة محلياً في متصفحك',
    invalidUrl: 'يرجى إدخال رابط صالح',
    aliasTaken: 'هذا الاسم مستخدم بالفعل',
    invalidAlias: 'الاسم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط',
    clearAll: 'مسح الكل',
  },
};

interface ShortenedUrl {
  alias: string;
  original: string;
  createdAt: string;
}

const STORAGE_KEY = 'quickshed-url-shortener';

function loadUrls(): ShortenedUrl[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveUrls(urls: ShortenedUrl[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch { return false; }
}

export default function UrlShortener({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [urls, setUrls] = useState<ShortenedUrl[]>(loadUrls);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [error, setError] = useState('');

  const persistUrls = useCallback((newUrls: ShortenedUrl[]) => {
    setUrls(newUrls);
    saveUrls(newUrls);
  }, []);

  const handleShorten = () => {
    setError('');
    if (!isValidUrl(longUrl)) {
      setError(t.invalidUrl);
      return;
    }
    const shortAlias = alias.trim() || Math.random().toString(36).substring(2, 8);
    if (urls.some((u) => u.alias === shortAlias)) {
      setError(t.aliasTaken);
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(shortAlias)) {
      setError(t.invalidAlias);
      return;
    }
    const newUrl: ShortenedUrl = {
      alias: shortAlias,
      original: longUrl,
      createdAt: new Date().toISOString(),
    };
    persistUrls([newUrl, ...urls]);
    setLongUrl('');
    setAlias('');
  };

  const handleDelete = (idx: number) => {
    const newUrls = urls.filter((_, i) => i !== idx);
    persistUrls(newUrls);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getShortUrl = (a: string) => `${window.location.origin}/s/${a}`;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
              {urls.map((url, idx) => (
                <div key={url.alias} className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-primary break-all">{getShortUrl(url.alias)}</code>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => handleCopy(getShortUrl(url.alias), idx)}>
                      {copiedIdx === idx ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </Button>
                    <a href={url.original} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="ghost" size="icon" className="size-7">
                        <ExternalLink className="size-3" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0 text-destructive" onClick={() => handleDelete(idx)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{url.original}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(url.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
