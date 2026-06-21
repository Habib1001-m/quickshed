'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link2, Twitter, Code, ChevronDown, Check, Copy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface ExportShareSectionProps {
  toolId: string;
  toolName: string;
}

export function ExportShareSection({ toolId, toolName }: ExportShareSectionProps) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';
  const [expanded, setExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const toolUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/tools/${encodeURIComponent(toolId)}`
    : '';

  const embedCode = `<iframe src="${toolUrl}" width="100%" height="600" frameborder="0" title="${toolName} - QuickShed"></iframe>`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toolUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = toolUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [toolUrl]);

  const handleShareTwitter = useCallback(() => {
    const text = locale === 'ar'
      ? `جرب ${toolName} على QuickShed - أدوات مجانية تحترم خصوصيتك!`
      : `Try ${toolName} on QuickShed - free privacy-first tools!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(toolUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [toolName, toolUrl, locale]);

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = embedCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }
  }, [embedCode]);

  return (
    <div
      className="mt-6 border border-border/40 rounded-xl overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground
          hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Share2 className="size-4 text-emerald-500" />
          {t('common.exportAndShare')}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Copy Tool Link */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="w-full justify-start gap-2 hover:bg-emerald-50 hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
              >
                {linkCopied ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Link2 className="size-4 text-muted-foreground" />
                )}
                {linkCopied
                  ? (locale === 'ar' ? 'تم نسخ الرابط!' : 'Link Copied!')
                  : t('common.copyToolLink')
                }
              </Button>

              {/* Share on Twitter */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareTwitter}
                className="w-full justify-start gap-2 hover:bg-sky-50 hover:border-sky-500/30 dark:hover:bg-sky-950/20"
              >
                <Twitter className="size-4 text-sky-500" />
                {t('common.shareOnTwitter')}
              </Button>

              {/* Embed Tool */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmbed}
                  className="w-full justify-start gap-2 hover:bg-emerald-50 hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
                >
                  {embedCopied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Code className="size-4 text-muted-foreground" />
                  )}
                  {embedCopied
                    ? (locale === 'ar' ? 'تم نسخ الكود!' : 'Code Copied!')
                    : t('common.embedTool')
                  }
                </Button>
                <div className="relative rounded-lg bg-muted/60 border border-border/30 p-3">
                  <code className="text-xs text-muted-foreground break-all leading-relaxed">
                    {embedCode}
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
