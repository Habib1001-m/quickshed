'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Database, Sparkles, Copy, Check } from 'lucide-react';

const labels = {
  en: {
    title: 'SQL Formatter',
    inputPlaceholder: 'Paste your SQL query here...',
    format: 'Format / Beautify',
    copy: 'Copy',
    copied: 'Copied!',
  },
  ar: {
    title: 'منسق SQL',
    inputPlaceholder: 'الصق استعلام SQL هنا...',
    format: 'تنسيق / تجميل',
    copy: 'نسخ',
    copied: 'تم النسخ!',
  },
};

/* ---------- SQL keywords ---------- */
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN',
  'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS', 'FULL', 'ON', 'AND', 'OR',
  'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY',
  'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'PRIMARY', 'KEY',
  'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE',
  'ASC', 'DESC', 'TOP', 'WITH', 'RECURSIVE', 'OVER', 'PARTITION',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'COALESCE', 'IFNULL', 'CAST',
  'CONVERT', 'TRUNCATE', 'REPLACE', 'MERGE', 'USING', 'NATURAL',
  'EXCEPT', 'INTERSECT', 'ANY', 'SOME', 'FETCH', 'NEXT', 'ROWS',
  'ONLY', 'FIRST', 'AFTER', 'BEFORE', 'ADD', 'COLUMN', 'MODIFY',
  'RENAME', 'TO', 'GRANT', 'REVOKE', 'BEGIN', 'COMMIT', 'ROLLBACK',
  'TRANSACTION', 'START', 'SAVEPOINT', 'RELEASE', 'IF', 'EXISTS',
  'TEMP', 'TEMPORARY', 'SCHEMA', 'DATABASE', 'USE', 'SHOW', 'DESCRIBE',
  'EXPLAIN', 'ANALYZE', 'VACUUM', 'REINDEX', 'CLUSTER', 'COMMENT',
  'DECLARE', 'CURSOR', 'OPEN', 'CLOSE', 'DEALLOCATE', 'PREPARE',
  'EXECUTE', 'DEALLOCATE', 'RAISE', 'NOTICE', 'EXCEPTION', 'RETURN',
  'RETURNS', 'LANGUAGE', 'PLPGSQL', 'VOLATILE', 'STABLE', 'IMMUTABLE',
  'STRICT', 'CALLED', 'INPUT', 'SECURITY', 'DEFINER', 'INVOKER',
  'COST', 'PARALLEL', 'SAFE', 'UNSAFE', 'RESTRICTED', 'LEAKPROOF',
];

/* ---------- format SQL ---------- */
function formatSQL(sql: string): string {
  let result = sql.trim();

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ');

  const newLineKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'CROSS JOIN', 'FULL JOIN', 'JOIN',
    'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
    'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT',
  ];

  // Add newlines before major keywords
  for (const kw of newLineKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, `\n${kw}`);
  }

  // Handle opening/closing parentheses for indentation
  const lines = result.split('\n').map(l => l.trim()).filter(Boolean);
  let indent = 0;
  const tab = '  ';
  const formatted: string[] = [];

  for (const line of lines) {
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;

    const leadingClose = line.startsWith(')');
    if (leadingClose) indent = Math.max(0, indent - 1);

    formatted.push(tab.repeat(indent) + line);

    indent += openParens - closeParens;
    if (indent < 0) indent = 0;
    if (!leadingClose) {
      indent += 0; // no extra indent change here
    }
  }

  return formatted.join('\n');
}

/* ---------- syntax highlighting ---------- */
function highlightSQL(sql: string): string {
  let result = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight strings
  result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>');
  result = result.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#98c379">$1</span>');

  // Highlight numbers
  result = result.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>');

  // Highlight keywords
  for (const kw of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    result = result.replace(regex, '<span style="color:#c678dd;font-weight:600">$1</span>');
  }

  // Highlight functions (word followed by parenthesis)
  result = result.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span style="color:#61afef">$1</span>(');

  // Highlight comments
  result = result.replace(/(--.*$)/gm, '<span style="color:#5c6370;font-style:italic">$1</span>');
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#5c6370;font-style:italic">$1</span>');

  return result;
}

/* ---------- main component ---------- */
export default function SqlFormatter({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    setOutput(formatSQL(input));
  }, [input]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  }, [output]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Database className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[200px] resize-y text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleFormat} variant="default" size="sm" className="tool-action-btn">
              <Sparkles className="size-4 me-1" />
              {t.format}
            </Button>
            {output && (
              <Button onClick={handleCopy} variant="ghost" size="sm" className="ms-auto">
                {copied ? <Check className="size-4 me-1" /> : <Copy className="size-4 me-1" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardContent className="pt-6">
            <pre
              className="tool-output text-sm font-mono whitespace-pre-wrap break-all bg-muted/50 rounded-md p-4 max-h-[500px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: highlightSQL(output) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
