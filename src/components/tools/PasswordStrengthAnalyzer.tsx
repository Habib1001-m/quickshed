'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'princess', 'football', 'shadow', 'superman', 'michael', 'letmein',
  'welcome', '1q2w3e4r', 'password1', '1234567890', 'admin', 'login',
]);

const labels = {
  en: {
    title: 'Password Strength Analyzer',
    password: 'Password',
    show: 'Show',
    hide: 'Hide',
    strength: 'Strength',
    veryWeak: 'Very Weak',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    veryStrong: 'Very Strong',
    crackTime: 'Estimated Crack Time',
    instantly: 'Instantly',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    years: 'years',
    centuries: 'Centuries+',
    analysis: 'Analysis',
    length: 'Length',
    uppercase: 'Uppercase',
    lowercase: 'Lowercase',
    numbers: 'Numbers',
    symbols: 'Symbols',
    has: '✓ Has',
    missing: '✗ Missing',
    suggestions: 'Suggestions',
    longerPwd: 'Use at least 12 characters',
    addUpper: 'Add uppercase letters',
    addLower: 'Add lowercase letters',
    addNumbers: 'Add numbers',
    addSymbols: 'Add symbols (!@#$...)',
    commonWarning: '⚠ This is a commonly used password!',
  },
  ar: {
    title: 'محلل قوة كلمة المرور',
    password: 'كلمة المرور',
    show: 'إظهار',
    hide: 'إخفاء',
    strength: 'القوة',
    veryWeak: 'ضعيفة جداً',
    weak: 'ضعيفة',
    fair: 'مقبولة',
    strong: 'قوية',
    veryStrong: 'قوية جداً',
    crackTime: 'الوقت المقدر للاختراق',
    instantly: 'فوراً',
    seconds: 'ثواني',
    minutes: 'دقائق',
    hours: 'ساعات',
    days: 'أيام',
    years: 'سنوات',
    centuries: 'قرون+',
    analysis: 'التحليل',
    length: 'الطول',
    uppercase: 'أحرف كبيرة',
    lowercase: 'أحرف صغيرة',
    numbers: 'أرقام',
    symbols: 'رموز',
    has: '✓ موجود',
    missing: '✗ مفقود',
    suggestions: 'اقتراحات',
    longerPwd: 'استخدم 12 حرفاً على الأقل',
    addUpper: 'أضف أحرفاً كبيرة',
    addLower: 'أضف أحرفاً صغيرة',
    addNumbers: 'أضف أرقاماً',
    addSymbols: 'أضف رموزاً (!@#$...)',
    commonWarning: '⚠ هذه كلمة مرور شائعة الاستخدام!',
  },
};

function estimateCrackTime(password: string): string {
  if (!password) return '';
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) charsetSize = 26;
  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSec = 1e10;
  const seconds = combinations / guessesPerSec;
  if (seconds < 1) return 'instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 365.25 * 86400) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 365.25 * 86400 * 100) return `${Math.round(seconds / (365.25 * 86400))} years`;
  return 'centuries';
}

export default function PasswordStrengthAnalyzer({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => {
    if (!password) return null;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumbers) score++;
    if (hasSymbols) score++;
    if (isCommon) score = Math.min(score, 1);

    const level = score <= 1 ? 0 : score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4;
    const crackTimeKey = estimateCrackTime(password);

    return { hasUpper, hasLower, hasNumbers, hasSymbols, isCommon, score, level, crackTimeKey };
  }, [password]);

  const strengthLabels = [t.veryWeak, t.weak, t.fair, t.strong, t.veryStrong];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

  const formatCrackTime = (key: string): string => {
    if (key === 'instantly') return t.instantly;
    if (key === 'centuries') return t.centuries;
    const parts = key.split(' ');
    const num = parts[0];
    const unit = parts[1];
    if (unit?.startsWith('second')) return `${num} ${t.seconds}`;
    if (unit?.startsWith('minute')) return `${num} ${t.minutes}`;
    if (unit?.startsWith('hour')) return `${num} ${t.hours}`;
    if (unit?.startsWith('day')) return `${num} ${t.days}`;
    if (unit?.startsWith('year')) return `${num} ${t.years}`;
    return key;
  };

  const suggestions = useMemo(() => {
    if (!analysis || !password) return [];
    const list: string[] = [];
    if (password.length < 12) list.push(t.longerPwd);
    if (!analysis.hasUpper) list.push(t.addUpper);
    if (!analysis.hasLower) list.push(t.addLower);
    if (!analysis.hasNumbers) list.push(t.addNumbers);
    if (!analysis.hasSymbols) list.push(t.addSymbols);
    return list;
  }, [analysis, password, t]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.password}</Label>
            <div className="flex gap-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                className="tool-input flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>

          {analysis && (
            <>
              {/* Strength Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.strength}</span>
                  <Badge variant={analysis.level >= 3 ? 'default' : 'destructive'}>{strengthLabels[analysis.level]}</Badge>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i <= analysis.level ? strengthColors[analysis.level] : 'bg-muted'}`} />
                  ))}
                </div>
              </div>

              {/* Crack Time */}
              <div className="tool-output rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t.crackTime}</div>
                <div className="text-lg font-bold">{formatCrackTime(analysis.crackTimeKey)}</div>
              </div>

              {analysis.isCommon && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                  {t.commonWarning}
                </div>
              )}

              {/* Analysis */}
              <div className="space-y-2">
                <div className="text-sm font-medium">{t.analysis}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className={`rounded-lg border p-2 text-center text-xs ${analysis.hasUpper ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="font-medium">{t.uppercase}</div>
                    <div>{analysis.hasUpper ? t.has : t.missing}</div>
                  </div>
                  <div className={`rounded-lg border p-2 text-center text-xs ${analysis.hasLower ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="font-medium">{t.lowercase}</div>
                    <div>{analysis.hasLower ? t.has : t.missing}</div>
                  </div>
                  <div className={`rounded-lg border p-2 text-center text-xs ${analysis.hasNumbers ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="font-medium">{t.numbers}</div>
                    <div>{analysis.hasNumbers ? t.has : t.missing}</div>
                  </div>
                  <div className={`rounded-lg border p-2 text-center text-xs ${analysis.hasSymbols ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="font-medium">{t.symbols}</div>
                    <div>{analysis.hasSymbols ? t.has : t.missing}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{t.length}: {password.length}</div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t.suggestions}</div>
                  <ul className="space-y-1">
                    {suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="text-amber-500">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
