'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, FileCode, Sparkles, Minimize2 } from 'lucide-react';

const labels = {
  en: {
    title: 'HTML / CSS / JS Beautifier',
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript',
    inputPlaceholder: 'Paste your code here...',
    outputPlaceholder: 'Formatted output will appear here...',
    beautify: 'Beautify',
    minify: 'Minify',
    copy: 'Copy',
    copied: 'Copied!',
  },
  ar: {
    title: 'منسق HTML / CSS / JS',
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript',
    inputPlaceholder: 'الصق الكود هنا...',
    outputPlaceholder: 'ستظهر النتيجة المنسقة هنا...',
    beautify: 'تنسيق',
    minify: 'ضغط',
    copy: 'نسخ',
    copied: 'تم النسخ!',
  },
};

type LangTab = 'html' | 'css' | 'javascript';

/* ---------- beautifiers ---------- */
function beautifyHTML(code: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  const selfClosing = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
  const closingTag = /^<\//;
  const openingTag = /^<[a-zA-Z]/;
  const voidOrSelfClose = /\/\s*>$/;

  const tokens = code.replace(/>\s*</g, '><').replace(/(<[^>]+>)/g, '\n$1\n').split('\n').map(s => s.trim()).filter(Boolean);

  for (const token of tokens) {
    if (closingTag.test(token)) {
      indent = Math.max(0, indent - 1);
    }
    formatted += tab.repeat(indent) + token + '\n';
    if (openingTag.test(token) && !closingTag.test(token) && !selfClosing.test(token) && !voidOrSelfClose.test(token)) {
      indent++;
    }
  }
  return formatted.trim();
}

function minifyHTML(code: string): string {
  return code
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .trim();
}

function beautifyCSS(code: string): string {
  let result = code.trim();
  result = result.replace(/\s*{\s*/g, ' {\n  ');
  result = result.replace(/\s*}\s*/g, '\n}\n\n');
  result = result.replace(/;\s*/g, ';\n  ');
  result = result.replace(/\n\s*\n/g, '\n\n');
  result = result.replace(/  \n}/g, '\n}');
  result = result.replace(/\{\s+\n/g, '{\n');
  return result.trim();
}

function minifyCSS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .trim();
}

function beautifyJS(code: string): string {
  let result = code.trim();
  result = result.replace(/;\s*/g, ';\n');
  result = result.replace(/\{\s*/g, '{\n  ');
  result = result.replace(/\s*\}/g, '\n}');
  result = result.replace(/,\s*\n/g, ',\n  ');
  const lines = result.split('\n');
  let indent = 0;
  const tab = '  ';
  const out: string[] = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('}')) indent = Math.max(0, indent - 1);
    out.push(tab.repeat(indent) + trimmed);
    if (trimmed.endsWith('{')) indent++;
  }
  return out.join('\n');
}

function minifyJS(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
    .trim();
}

/* ---------- syntax highlighting ---------- */
function highlightCode(code: string, lang: LangTab): string {
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'html') {
    result = result.replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#e06c75">$2</span>');
    result = result.replace(/([\w-]+)(=)/g, '<span style="color:#d19a66">$1</span>$2');
    result = result.replace(/(&quot;|")(.*?)(&quot;|")/g, '<span style="color:#98c379">"$2"</span>');
  } else if (lang === 'css') {
    result = result.replace(/([\w-]+)\s*:/g, '<span style="color:#e06c75">$1</span>:');
    result = result.replace(/(#[0-9a-fA-F]{3,8})/g, '<span style="color:#d19a66">$1</span>');
    result = result.replace(/(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw|s|ms)/g, '<span style="color:#d19a66">$1$2</span>');
  } else {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|try|catch|finally|throw|async|await|yield|typeof|instanceof|in|of|true|false|null|undefined|void|delete)\b/g;
    result = result.replace(keywords, '<span style="color:#c678dd">$1</span>');
    result = result.replace(/(&quot;|')(.*?)(&quot;|')/g, '<span style="color:#98c379">"$2"</span>');
    result = result.replace(/(\d+(?:\.\d+)?)/g, '<span style="color:#d19a66">$1</span>');
  }
  return result;
}

/* ---------- main component ---------- */
export default function HtmlBeautifier({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [tab, setTab] = useState<LangTab>('html');
  const [inputs, setInputs] = useState<Record<LangTab, string>>({ html: '', css: '', javascript: '' });
  const [outputs, setOutputs] = useState<Record<LangTab, string>>({ html: '', css: '', javascript: '' });
  const [copied, setCopied] = useState(false);

  const handleBeautify = useCallback(() => {
    const code = inputs[tab];
    let result = '';
    switch (tab) {
      case 'html': result = beautifyHTML(code); break;
      case 'css': result = beautifyCSS(code); break;
      case 'javascript': result = beautifyJS(code); break;
    }
    setOutputs(prev => ({ ...prev, [tab]: result }));
  }, [inputs, tab]);

  const handleMinify = useCallback(() => {
    const code = inputs[tab];
    let result = '';
    switch (tab) {
      case 'html': result = minifyHTML(code); break;
      case 'css': result = minifyCSS(code); break;
      case 'javascript': result = minifyJS(code); break;
    }
    setOutputs(prev => ({ ...prev, [tab]: result }));
  }, [inputs, tab]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(outputs[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputs, tab]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <FileCode className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as LangTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">{t.html}</TabsTrigger>
              <TabsTrigger value="css">{t.css}</TabsTrigger>
              <TabsTrigger value="javascript">{t.javascript}</TabsTrigger>
            </TabsList>
            {(['html', 'css', 'javascript'] as const).map((l) => (
              <TabsContent key={l} value={l} className="mt-4 space-y-4">
                <Textarea
                  value={inputs[l]}
                  onChange={(e) => setInputs(prev => ({ ...prev, [l]: e.target.value }))}
                  placeholder={t.inputPlaceholder}
                  className="tool-input min-h-[200px] resize-y text-sm font-mono"
                />
              </TabsContent>
            ))}
          </Tabs>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleBeautify} variant="default" size="sm" className="tool-action-btn">
              <Sparkles className="size-4 me-1" />
              {t.beautify}
            </Button>
            <Button onClick={handleMinify} variant="secondary" size="sm">
              <Minimize2 className="size-4 me-1" />
              {t.minify}
            </Button>
            {outputs[tab] && (
              <Button onClick={handleCopy} variant="ghost" size="sm" className="ms-auto">
                {copied ? <Check className="size-4 me-1" /> : <Copy className="size-4 me-1" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {outputs[tab] && (
        <Card>
          <CardContent className="pt-6">
            <pre
              className="tool-output text-sm font-mono whitespace-pre-wrap break-all bg-muted/50 rounded-md p-4 max-h-[500px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: highlightCode(outputs[tab], tab) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
