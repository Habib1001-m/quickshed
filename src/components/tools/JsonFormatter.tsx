'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Check, Braces, Minus, ShieldCheck, ChevronRight, ChevronDown, Eye, Code } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';

const labels = {
  en: {
    title: 'JSON Formatter',
    inputPlaceholder: 'Paste your JSON here...',
    format: 'Format / Prettify',
    minify: 'Minify',
    validate: 'Validate',
    copy: 'Copy',
    copied: 'Copied!',
    validJson: 'Valid JSON ✓',
    invalidJson: 'Invalid JSON',
    errorAt: 'Error at',
    treeView: 'Tree View',
    rawView: 'Raw View',
    empty: '(empty)',
    null: 'null',
    true: 'true',
    false: 'false',
    object: 'Object',
    array: 'Array',
    items: 'items',
  },
  ar: {
    title: 'منسق JSON',
    inputPlaceholder: 'الصق JSON هنا...',
    format: 'تنسيق / تجميل',
    minify: 'ضغط',
    validate: 'التحقق',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    validJson: 'JSON صالح ✓',
    invalidJson: 'JSON غير صالح',
    errorAt: 'خطأ في',
    treeView: 'عرض الشجرة',
    rawView: 'عرض الخام',
    empty: '(فارغ)',
    null: 'فارغ',
    true: 'صحيح',
    false: 'خطأ',
    object: 'كائن',
    array: 'مصفوفة',
    items: 'عناصر',
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- syntax-highlighted JSON ---------- */
function highlightJson(json: string): string {
  const tokenPattern = /("(?:\\.|[^"\\])*")(\s*:)?|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;
  let highlighted = '';
  let lastIndex = 0;

  for (const match of json.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    const isKey = Boolean(match[2]);
    const value = isKey ? token.slice(0, -match[2]!.length) : token;
    const suffix = isKey ? match[2] : '';

    highlighted += escapeHtml(json.slice(lastIndex, index));

    if (isKey) {
      highlighted += `<span style="color:#e06c75">${escapeHtml(value)}</span>${escapeHtml(suffix)}`;
    } else if (value.startsWith('"')) {
      highlighted += `<span style="color:#98c379">${escapeHtml(value)}</span>`;
    } else if (/^-?\d/.test(value)) {
      highlighted += `<span style="color:#d19a66">${escapeHtml(value)}</span>`;
    } else if (value === 'true' || value === 'false') {
      highlighted += `<span style="color:#56b6c2">${value}</span>`;
    } else {
      highlighted += `<span style="color:#c678dd">${value}</span>`;
    }

    lastIndex = index + token.length;
  }

  highlighted += escapeHtml(json.slice(lastIndex));
  return highlighted;
}

/* ---------- collapsible tree node ---------- */
function TreeNode({ name, value, depth, isLast, t }: {
  name: string | null;
  value: unknown;
  depth: number;
  isLast: boolean;
  t: typeof labels.en;
}) {
  const [open, setOpen] = useState(depth < 3);

  if (value === null) {
    return (
      <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
        {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-[#c678dd]">{t.null}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
        {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-[#56b6c2]">{value ? t.true : t.false}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
        {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-[#d19a66]">{value}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
        {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-muted-foreground">: </span>}
        <span className="text-[#98c379]">&quot;{value}&quot;</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
          {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">[]</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </div>
      );
    }
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1 font-mono text-sm cursor-pointer hover:bg-muted/50 rounded" style={{ paddingLeft: depth * 16 }}>
          <CollapsibleTrigger asChild>
            <button className="p-0.5 hover:bg-muted rounded">
              {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </button>
          </CollapsibleTrigger>
          {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">[</span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{value.length} {t.items}</Badge>
        </div>
        <CollapsibleContent>
          {value.map((item, i) => (
            <TreeNode key={i} name={null} value={item} depth={depth + 1} isLast={i === value.length - 1} t={t} />
          ))}
          <div className="font-mono text-sm text-muted-foreground" style={{ paddingLeft: depth * 16 }}>]{!isLast ? ',' : ''}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <div className="flex items-center gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
          {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">{'{}'}</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </div>
      );
    }
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1 font-mono text-sm cursor-pointer hover:bg-muted/50 rounded" style={{ paddingLeft: depth * 16 }}>
          <CollapsibleTrigger asChild>
            <button className="p-0.5 hover:bg-muted rounded">
              {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </button>
          </CollapsibleTrigger>
          {name !== null && <span className="text-[#e06c75]">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-muted-foreground">: </span>}
          <span className="text-muted-foreground">{'{'}</span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{t.object}</Badge>
        </div>
        <CollapsibleContent>
          {entries.map(([k, v], i) => (
            <TreeNode key={k} name={k} value={v} depth={depth + 1} isLast={i === entries.length - 1} t={t} />
          ))}
          <div className="font-mono text-sm text-muted-foreground" style={{ paddingLeft: depth * 16 }}>{'}'}{!isLast ? ',' : ''}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return null;
}

/* ---------- main component ---------- */
export default function JsonFormatter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'tree'>('raw');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const parsed = useMemo<{ value: unknown } | null>(() => {
    if (!input.trim()) return null;
    try {
      return { value: JSON.parse(input) };
    } catch {
      return null;
    }
  }, [input]);

  const handleFormat = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
      setError(null);
      setIsValid(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsValid(false);
      setOutput('');
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj));
      setError(null);
      setIsValid(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsValid(false);
      setOutput('');
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    try {
      JSON.parse(input);
      setIsValid(true);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setIsValid(false);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    setCopied(false);
    if (await copyTextToClipboard(output)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  }, [output]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <Braces className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 gap-4">
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setIsValid(null); setError(null); }}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[200px] resize-y text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleFormat} className="tool-action-btn" size="sm">
              <Braces className="size-4 me-1" />
              {t.format}
            </Button>
            <Button onClick={handleMinify} variant="secondary" size="sm">
              <Minus className="size-4 me-1" />
              {t.minify}
            </Button>
            <Button onClick={handleValidate} variant="outline" size="sm">
              <ShieldCheck className="size-4 me-1" />
              {t.validate}
            </Button>
            {output && (
              <Button onClick={handleCopy} variant="ghost" size="sm" className="ms-auto">
                {copied ? <Check className="size-4 me-1 text-emerald-500" /> : <Copy className="size-4 me-1" />}
                {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            )}
          </div>
          {isValid !== null && (
            <div className="mt-3">
              {isValid ? (
                <Badge className="bg-emerald-600 text-white">{t.validJson}</Badge>
              ) : (
                <div className="space-y-1">
                  <Badge variant="destructive">{t.invalidJson}</Badge>
                  {error && (
                    <p className="text-sm text-destructive font-mono mt-1">{t.errorAt}: {error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(output || parsed) && (
        <Card className="tool-wrapper-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'raw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('raw')}
              >
                <Code className="size-4 me-1" />
                {t.rawView}
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <Eye className="size-4 me-1" />
                {t.treeView}
              </Button>
            </div>
            {viewMode === 'raw' && output && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4 me-1 text-emerald-500" /> : <Copy className="size-4 me-1" />}
                {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {viewMode === 'raw' ? (
              output ? (
                <pre
                  className="tool-output text-sm font-mono whitespace-pre-wrap break-all max-h-[500px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: highlightJson(output) }}
                />
              ) : (
                <p className="text-muted-foreground text-sm">{t.inputPlaceholder}</p>
              )
            ) : (
              parsed ? (
                <div className="tool-output max-h-[500px] overflow-auto">
                  <TreeNode name={null} value={parsed.value} depth={0} isLast t={t} />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t.inputPlaceholder}</p>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
