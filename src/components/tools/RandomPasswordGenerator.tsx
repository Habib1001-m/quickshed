'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { KeyRound, RefreshCw, Copy, Check, Download } from 'lucide-react';

const labels = {
  en: {
    title: 'Random Password Generator',
    length: 'Length',
    uppercase: 'Uppercase (A-Z)',
    lowercase: 'Lowercase (a-z)',
    numbers: 'Numbers (0-9)',
    symbols: 'Symbols (!@#$...)',
    generate: 'Generate',
    count: 'Number of passwords',
    pronounceable: 'Pronounceable',
    pinMode: 'PIN Mode (digits only)',
    copyAll: 'Copy All',
    copied: 'Copied!',
    download: 'Download',
    pinLength: 'PIN Length',
  },
  ar: {
    title: 'مولّد كلمات المرور العشوائية',
    length: 'الطول',
    uppercase: 'أحرف كبيرة (A-Z)',
    lowercase: 'أحرف صغيرة (a-z)',
    numbers: 'أرقام (0-9)',
    symbols: 'رموز (!@#$...)',
    generate: 'توليد',
    count: 'عدد كلمات المرور',
    pronounceable: 'قابلة للنطق',
    pinMode: 'وضع الرقم السري (أرقام فقط)',
    copyAll: 'نسخ الكل',
    copied: 'تم النسخ!',
    download: 'تحميل',
    pinLength: 'طول الرقم السري',
  },
};

const CONSONANTS = 'bcdfghjklmnpqrstvwxz';
const VOWELS = 'aeiou';

function randomIndex(max: number): number {
  if (max <= 0) return 0;
  const values = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % max;
}

function generatePronounceable(length: number): string {
  let result = '';
  let useConsonant = true;
  for (let i = 0; i < length; i++) {
    if (useConsonant) {
      result += CONSONANTS[randomIndex(CONSONANTS.length)];
    } else {
      result += VOWELS[randomIndex(VOWELS.length)];
    }
    useConsonant = !useConsonant;
  }
  return result;
}

export default function RandomPasswordGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [pronounceable, setPronounceable] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generatePassword = useCallback(() => {
    if (pinMode) {
      const pins: string[] = [];
      for (let i = 0; i < count; i++) {
        let pin = '';
        for (let j = 0; j < length; j++) {
          pin += randomIndex(10).toString();
        }
        pins.push(pin);
      }
      setPasswords(pins);
      return;
    }

    if (pronounceable) {
      const results: string[] = [];
      for (let i = 0; i < count; i++) {
        results.push(generatePronounceable(length));
      }
      setPasswords(results);
      return;
    }

    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      let pwd = '';
      for (let j = 0; j < length; j++) {
        pwd += charset[randomIndex(charset.length)];
      }
      results.push(pwd);
    }
    setPasswords(results);
  }, [length, useUpper, useLower, useNumbers, useSymbols, pronounceable, pinMode, count]);

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyOne = (idx: number) => {
    navigator.clipboard.writeText(passwords[idx]);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([passwords.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <KeyRound className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{pinMode ? t.pinLength : t.length}</Label>
              <span className="text-sm font-bold text-primary">{length}</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={([v]) => setLength(v)}
              min={pinMode ? 4 : 12}
              max={pinMode ? 8 : 128}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.count}</Label>
            <Slider value={[count]} onValueChange={([v]) => setCount(v)} min={1} max={50} step={1} />
            <span className="text-sm font-bold text-primary">{count}</span>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={pinMode} onCheckedChange={setPinMode} />
            <Label>{t.pinMode}</Label>
          </div>

          {!pinMode && (
            <div className="flex items-center gap-3">
              <Switch checked={pronounceable} onCheckedChange={setPronounceable} />
              <Label>{t.pronounceable}</Label>
            </div>
          )}

          {!pinMode && !pronounceable && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={useUpper} onCheckedChange={setUseUpper} />
                <Label className="text-xs">{t.uppercase}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={useLower} onCheckedChange={setUseLower} />
                <Label className="text-xs">{t.lowercase}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
                <Label className="text-xs">{t.numbers}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
                <Label className="text-xs">{t.symbols}</Label>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={generatePassword} className="tool-action-btn flex items-center gap-2">
              <RefreshCw className="size-4" />{t.generate}
            </Button>
            {passwords.length > 0 && (
              <>
                <Button variant="outline" onClick={copyAll} className="flex items-center gap-2">
                  {copiedAll ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copiedAll ? <span className="copy-feedback">{t.copied}</span> : t.copyAll}
                </Button>
                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="size-4" />{t.download}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {passwords.length > 0 && (
        <Card className="tool-wrapper-card">
          <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {passwords.map((pwd, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <code className="flex-1 text-sm font-mono break-all">{pwd}</code>
                <Button variant="ghost" size="sm" onClick={() => copyOne(i)} className="shrink-0">
                  {copiedIdx === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
