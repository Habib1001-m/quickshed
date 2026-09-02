'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RefreshCw, KeyRound, Plus, Trash2 } from 'lucide-react';

const labels = {
  en: {
    title: 'Password Generator',
    length: 'Length',
    uppercase: 'Uppercase (A-Z)',
    lowercase: 'Lowercase (a-z)',
    numbers: 'Numbers (0-9)',
    symbols: 'Symbols (!@#$...)',
    generate: 'Generate',
    copy: 'Copy',
    copied: 'Copied!',
    strength: 'Strength',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    veryStrong: 'Very Strong',
    multiple: 'Generate Multiple',
    addPassword: 'Add Another',
    clearAll: 'Clear All',
    charSets: 'At least one character set must be selected',
  },
  ar: {
    title: 'مولّد كلمات المرور',
    length: 'الطول',
    uppercase: 'أحرف كبيرة (A-Z)',
    lowercase: 'أحرف صغيرة (a-z)',
    numbers: 'أرقام (0-9)',
    symbols: 'رموز (!@#$...)',
    generate: 'توليد',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    strength: 'القوة',
    weak: 'ضعيفة',
    fair: 'مقبولة',
    strong: 'قوية',
    veryStrong: 'قوية جداً',
    multiple: 'توليد متعدد',
    addPassword: 'إضافة أخرى',
    clearAll: 'مسح الكل',
    charSets: 'يجب اختيار مجموعة أحرف واحدة على الأقل',
  },
};

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
};

function generatePassword(length: number, options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  let pool = '';
  const required: string[] = [];
  if (options.upper) { pool += CHARS.upper; required.push(CHARS.upper); }
  if (options.lower) { pool += CHARS.lower; required.push(CHARS.lower); }
  if (options.numbers) { pool += CHARS.numbers; required.push(CHARS.numbers); }
  if (options.symbols) { pool += CHARS.symbols; required.push(CHARS.symbols); }
  if (!pool) return '';

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  const chars = Array.from(array, (n) => pool[n % pool.length]);

  required.forEach((req, i) => {
    if (i < chars.length) {
      const randIdx = new Uint32Array(1);
      crypto.getRandomValues(randIdx);
      chars[i] = req[randIdx[0] % req.length];
    }
  });

  for (let i = chars.length - 1; i > 0; i--) {
    const j = new Uint32Array(1);
    crypto.getRandomValues(j);
    const swap = j[0] % (i + 1);
    [chars[i], chars[swap]] = [chars[swap], chars[i]];
  }

  return chars.join('');
}

function getStrength(password: string): { level: string; pct: number; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak', pct: 25, color: 'bg-red-500' };
  if (score <= 4) return { level: 'fair', pct: 50, color: 'bg-amber-500' };
  if (score <= 5) return { level: 'strong', pct: 75, color: 'bg-sky-500' };
  return { level: 'veryStrong', pct: 100, color: 'bg-emerald-500' };
}

export default function PasswordGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const hasAnySet = upper || lower || numbers || symbols;

  const handleGenerate = useCallback(() => {
    if (!hasAnySet) return;
    const pw = generatePassword(length, { upper, lower, numbers, symbols });
    setPasswords((prev) => [pw, ...prev]);
  }, [length, upper, lower, numbers, symbols, hasAnySet]);

  const handleCopy = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // No false positive success.
    }
  }, []);

  const handleAddMultiple = useCallback(() => {
    if (!hasAnySet) return;
    const newPws = Array.from({ length: 5 }, () =>
      generatePassword(length, { upper, lower, numbers, symbols })
    );
    setPasswords((prev) => [...newPws, ...prev]);
  }, [length, upper, lower, numbers, symbols, hasAnySet]);

  const currentPassword = passwords[0] || '';
  const strength = currentPassword ? getStrength(currentPassword) : null;

  const strengthLabel = strength
    ? { weak: t.weak, fair: t.fair, strong: t.strong, veryStrong: t.veryStrong }[strength.level]
    : '';

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <KeyRound className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Length slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.length}</Label>
              <span className="text-sm font-mono font-bold text-primary">{length}</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(v) => setLength(v[0])}
              min={8}
              max={128}
              step={1}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="pw-upper">{t.uppercase}</Label>
              <Switch id="pw-upper" checked={upper} onCheckedChange={setUpper} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="pw-lower">{t.lowercase}</Label>
              <Switch id="pw-lower" checked={lower} onCheckedChange={setLower} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="pw-num">{t.numbers}</Label>
              <Switch id="pw-num" checked={numbers} onCheckedChange={setNumbers} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer" htmlFor="pw-sym">{t.symbols}</Label>
              <Switch id="pw-sym" checked={symbols} onCheckedChange={setSymbols} />
            </div>
          </div>

          {!hasAnySet && (
            <p className="text-sm text-destructive">{t.charSets}</p>
          )}

          {/* Generate buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} disabled={!hasAnySet} className="tool-action-btn gap-2">
              <RefreshCw className="size-4" />
              {t.generate}
            </Button>
            <Button onClick={handleAddMultiple} disabled={!hasAnySet} variant="outline" className="gap-2">
              <Plus className="size-4" />
              {t.addPassword}
            </Button>
            {passwords.length > 0 && (
              <Button onClick={() => setPasswords([])} variant="ghost" className="gap-2 text-destructive">
                <Trash2 className="size-4" />
                {t.clearAll}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current password display with strength */}
      {currentPassword && (
        <Card className="tool-wrapper-card">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <code className="tool-output flex-1 break-all text-sm font-mono">
                {currentPassword}
              </code>
              <Button variant="outline" size="icon" onClick={() => handleCopy(currentPassword, 0)}>
                {copiedIdx === 0 ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            {strength && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.strength}</span>
                  <Badge variant="outline" className="text-xs">{strengthLabel}</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Password list */}
      {passwords.length > 1 && (
        <Card className="tool-wrapper-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.multiple} ({passwords.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {passwords.slice(1).map((pw, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <code className="tool-output flex-1 break-all text-xs font-mono px-3 py-1.5">
                    {pw}
                  </code>
                  <Button variant="ghost" size="icon" className="shrink-0 size-8" onClick={() => handleCopy(pw, idx + 1)}>
                    {copiedIdx === idx + 1 ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
