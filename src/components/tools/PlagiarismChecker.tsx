'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

function tokenizeSentences(text: string): string[] {
  return text
    .split(/[.!?؟。\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 5);
}

function tokenizePhrases(text: string, minLen = 3): string[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  for (let i = 0; i <= words.length - minLen; i++) {
    for (let len = minLen; len <= Math.min(6, words.length - i); len++) {
      phrases.push(words.slice(i, i + len).join(' '));
    }
  }
  return phrases;
}

export default function PlagarismChecker({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [original, setOriginal] = useState('');
  const [yours, setYours] = useState('');

  const result = useMemo(() => {
    if (!original.trim() || !yours.trim()) return null;

    const origSentences = tokenizeSentences(original);
    const origPhrases = tokenizePhrases(original);
    const yourSentences = tokenizeSentences(yours);

    // Match sentences
    const matchedSentences: { original: string; yours: string }[] = [];
    const yourHighlighted: { text: string; isMatch: boolean }[] = [];

    const origSet = new Set(origSentences);
    for (const s of yourSentences) {
      if (origSet.has(s)) {
        matchedSentences.push({ original: s, yours: s });
      }
    }

    // Phrase-level matching for highlighting
    const origPhraseSet = new Set(origPhrases);
    const yourWords = yours.split(/(\s+)/);

    let currentPhrase = '';

    for (let i = 0; i < yourWords.length; i++) {
      currentPhrase += yourWords[i];
      const normalized = currentPhrase.toLowerCase().trim();

      if (normalized.split(/\s+/).length >= 3 && origPhraseSet.has(normalized)) {
        // This phrase matches — mark it
        yourHighlighted.push({ text: currentPhrase, isMatch: true });
        currentPhrase = '';
      } else if (normalized.split(/\s+/).length > 6) {
        // Phrase too long, reset
        yourHighlighted.push({ text: currentPhrase, isMatch: false });
        currentPhrase = '';
      }
    }
    if (currentPhrase.trim()) {
      yourHighlighted.push({ text: currentPhrase, isMatch: false });
    }

    // Similarity percentage
    const totalYourSentences = yourSentences.length || 1;
    const matchCount = matchedSentences.length;
    const similarity = Math.min(100, Math.round((matchCount / totalYourSentences) * 100));

    return { matchedSentences, yourHighlighted, similarity };
  }, [original, yours]);

  const simColor = result
    ? result.similarity > 50
      ? 'text-destructive'
      : result.similarity > 20
        ? 'text-amber-600'
        : 'text-emerald-600'
    : '';

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'مدقق تشابه النصوص' : 'Text Similarity Checker'}
        </h2>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-sm">
        <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <span className="text-amber-700 dark:text-amber-400">
          {isAr
            ? 'هذه أداة محلية لمقارنة نصين والعثور على الجمل والعبارات المتطابقة. لا تحدد مصدر النص أو تثبت الانتحال.'
            : 'This local tool compares two supplied texts for matching sentences and phrases. It does not identify sources or prove plagiarism.'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label>{isAr ? 'النص الأصلي' : 'Original Text'}</Label>
          <Textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={isAr ? 'الصق النص الأصلي هنا...' : 'Paste original text here...'}
            className="tool-input min-h-[150px] text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'نصك' : 'Your Text'}</Label>
          <Textarea
            value={yours}
            onChange={(e) => setYours(e.target.value)}
            placeholder={isAr ? 'الصق نصك هنا...' : 'Paste your text here...'}
            className="tool-input min-h-[150px] text-sm"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <Card className="tool-output">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {isAr ? 'نسبة التشابه' : 'Similarity'}
                </div>
                <div className={`text-3xl font-bold ${simColor}`}>
                  {result.similarity}%
                </div>
              </div>
              <Badge
                variant={result.similarity > 50 ? 'destructive' : result.similarity > 20 ? 'secondary' : 'outline'}
              >
                {result.similarity > 50
                  ? isAr ? 'تشابه عالي' : 'High similarity'
                  : result.similarity > 20
                    ? isAr ? 'تشابه متوسط' : 'Moderate similarity'
                    : isAr ? 'تشابه منخفض' : 'Low similarity'}
              </Badge>
            </CardContent>
          </Card>

          {result.matchedSentences.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {isAr ? 'الجمل المتطابقة' : 'Matching Sentences'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.matchedSentences.map((m, i) => (
                    <div
                      key={i}
                      className="rounded bg-destructive/10 border border-destructive/20 p-2 text-sm"
                    >
                      {m.yours}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="tool-output">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {isAr ? 'النص مع تمييز التطابق' : 'Highlighted Text'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                {result.yourHighlighted.map((segment, i) =>
                  segment.isMatch ? (
                    <span key={i} className="bg-destructive/20 text-foreground px-0.5 rounded">
                      {segment.text}
                    </span>
                  ) : (
                    <span key={i}>{segment.text}</span>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
