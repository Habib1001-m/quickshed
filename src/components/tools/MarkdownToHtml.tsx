'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/lib/i18n';
import { copyTextToClipboard } from '@/lib/clipboard';
import { Copy, Check, FileCode, Eye } from 'lucide-react';

const labels = {
  en: {
    title: 'Markdown to HTML',
    inputPlaceholder: 'Type your Markdown here...',
    preview: 'Preview',
    source: 'HTML Source',
    copied: 'Copied!',
    copy: 'Copy HTML',
  },
  ar: {
    title: 'ماركداون إلى HTML',
    inputPlaceholder: 'اكتب ماركداون هنا...',
    preview: 'معاينة',
    source: 'كود HTML',
    copied: 'تم النسخ!',
    copy: 'نسخ HTML',
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

function sanitizeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

/**
 * Markdown images are a separate policy from explicit links. Only local blob
 * URLs and base64-encoded raster data URLs can render; every other image URL
 * becomes text so previewing Markdown cannot initiate network egress.
 * SVG data URLs are intentionally excluded because an SVG can reference
 * additional resources even though its outer URL is local.
 */
function sanitizeImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (/^blob:/i.test(trimmed)) return trimmed;
  if (/^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/]+={0,2}$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function blockedImageHtml(alt: string, message: string): string {
  // `alt` has already passed through escapeHtml before the Markdown rules run.
  const altSuffix = alt ? ` — ${alt}` : '';
  return `<span data-markdown-image-blocked="true" role="status">${escapeHtml(message)}${altSuffix}</span>`;
}

function markdownToHtml(md: string, imageBlockedMessage: string): string {
  let html = escapeHtml(md);

  // Code blocks (must be before other rules)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Images: never reuse the explicit-link sanitizer here; remote and unsafe
  // image URLs must not become automatically loading <img> elements.
  html = html.replace(/!\[([^\]]*)\]\(([^)\r\n]*)\)/g, (_match, alt: string, url: string) => {
    const safeImageUrl = sanitizeImageUrl(url);
    return safeImageUrl
      ? `<img src="${safeImageUrl}" alt="${alt}" />`
      : blockedImageHtml(alt, imageBlockedMessage);
  });

  // Links
  html = html.replace(/(?<!!)\[([^\]]+)\]\(([^)\r\n]+)\)/g, (_match, text: string, url: string) => {
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Horizontal rule
  html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr />');

  // Unordered lists
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Paragraphs — wrap loose text
  html = html.replace(/^(?!<[huolbdpi]|<li|<hr|<pre|<code)(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

export default function MarkdownToHtml({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const { t: translate } = useI18n();
  const [markdown, setMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const imageBlockedMessage = translate('tool.markdownImageBlocked');

  const html = useMemo(
    () => (markdown ? markdownToHtml(markdown, imageBlockedMessage) : ''),
    [markdown, imageBlockedMessage],
  );

  const handleCopy = async () => {
    setCopied(false);
    if (await copyTextToClipboard(html)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <FileCode className="size-5" />
            {t.title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!html}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="tool-input min-h-[200px] resize-y text-base font-mono"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="preview">
            <TabsList className="mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {t.preview}
              </TabsTrigger>
              <TabsTrigger value="source" className="flex items-center gap-1.5">
                <FileCode className="size-4" />
                {t.source}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div
                className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 min-h-[200px]"
                data-testid="markdown-preview"
                dangerouslySetInnerHTML={{ __html: html || `<p class="text-muted-foreground">${t.inputPlaceholder}</p>` }}
              />
            </TabsContent>
            <TabsContent value="source">
              <pre
                className="tool-output rounded-md border bg-muted/50 p-4 min-h-[200px] overflow-auto text-sm font-mono whitespace-pre-wrap break-all"
                data-testid="markdown-source"
              >
                {html || `<p>${t.inputPlaceholder}</p>`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
