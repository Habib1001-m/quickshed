'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GitCompare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const labels = {
  en: {
    title: 'Text Diff',
    original: 'Original Text',
    modified: 'Modified Text',
    additions: 'Additions',
    deletions: 'Deletions',
    unchanged: 'Unchanged',
    placeholderOrig: 'Paste original text here...',
    placeholderMod: 'Paste modified text here...',
    noDiff: 'No differences found — texts are identical!',
  },
  ar: {
    title: 'مقارنة النصوص',
    original: 'النص الأصلي',
    modified: 'النص المعدّل',
    additions: 'الإضافات',
    deletions: 'الحذوفات',
    unchanged: 'بدون تغيير',
    placeholderOrig: 'الصق النص الأصلي هنا...',
    placeholderMod: 'الصق النص المعدّل هنا...',
    noDiff: 'لا توجد اختلافات — النصان متطابقان!',
  },
};

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNum: number;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  // Simple LCS-based diff
  const m = origLines.length;
  const n = modLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      result.unshift({ type: 'unchanged', content: origLines[i - 1], lineNum: i });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', content: modLines[j - 1], lineNum: j });
      j--;
    } else if (i > 0) {
      result.unshift({ type: 'removed', content: origLines[i - 1], lineNum: i });
      i--;
    }
  }

  return result;
}

export default function TextDiff({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const diffResult = useMemo(() => {
    if (!original && !modified) return { lines: [], additions: 0, deletions: 0, unchanged: 0 };
    const lines = computeDiff(original, modified);
    return {
      lines,
      additions: lines.filter((l) => l.type === 'added').length,
      deletions: lines.filter((l) => l.type === 'removed').length,
      unchanged: lines.filter((l) => l.type === 'unchanged').length,
    };
  }, [original, modified]);

  const lineColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'removed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      case 'unchanged':
        return 'bg-transparent text-foreground';
    }
  };

  const linePrefix = (type: DiffLine['type']) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '−';
      case 'unchanged': return ' ';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <GitCompare className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.original}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder={t.placeholderOrig}
              className="tool-input min-h-[200px] resize-y text-base font-mono"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.modified}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder={t.placeholderMod}
              className="tool-input min-h-[200px] resize-y text-base font-mono"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
          +{diffResult.additions} {t.additions}
        </Badge>
        <Badge variant="outline" className="text-rose-600 border-rose-300">
          −{diffResult.deletions} {t.deletions}
        </Badge>
        <Badge variant="outline">
          {diffResult.unchanged} {t.unchanged}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          {diffResult.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noDiff}</p>
          ) : (
            <div className="tool-output max-h-96 overflow-y-auto rounded-md border text-sm font-mono">
              {diffResult.lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex px-3 py-0.5 ${lineColor(line.type)} ${line.type !== 'unchanged' ? 'font-semibold' : ''}`}
                >
                  <span className="w-6 shrink-0 text-center opacity-50 select-none">
                    {linePrefix(line.type)}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line.content}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
