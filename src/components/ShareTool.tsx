'use client';

import { useState, useCallback } from 'react';
import { Share2, Link2, Twitter, Check, Copy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ShareToolProps {
  toolId: string;
  toolName: string;
}

export function ShareTool({ toolId, toolName }: ShareToolProps) {
  const { locale } = useI18n();
  const [copied, setCopied] = useState(false);

  const toolUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${locale}/tools/${encodeURIComponent(toolId)}`
    : '';

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = toolUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [toolUrl]);

  const shareTwitter = useCallback(() => {
    const text = locale === 'ar' 
      ? `جرب ${toolName} على QuickShed - أدوات مجانية تحترم خصوصيتك!`
      : `Try ${toolName} on QuickShed - free privacy-first tools!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(toolUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [toolName, toolUrl, locale]);

  const shareFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [toolUrl]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 glow-focus"
          aria-label={locale === 'ar' ? 'مشاركة الأداة' : 'Share tool'}
        >
          <Share2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-52 p-2 glass-strong rounded-xl border-border/50"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={copyLink}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-start"
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4 text-muted-foreground" />
            )}
            {copied 
              ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') 
              : (locale === 'ar' ? 'نسخ الرابط' : 'Copy Link')
            }
          </button>
          <button
            onClick={shareTwitter}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-start"
          >
            <Twitter className="size-4 text-sky-500" />
            {locale === 'ar' ? 'مشاركة على تويتر' : 'Share on Twitter'}
          </button>
          <button
            onClick={shareFacebook}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-start"
          >
            <Link2 className="size-4 text-blue-600" />
            {locale === 'ar' ? 'مشاركة على فيسبوك' : 'Share on Facebook'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
