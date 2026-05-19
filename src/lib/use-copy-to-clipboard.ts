'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = useCallback(async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) setCopiedId(id);
      toast({
        description: 'Copied to clipboard!',
        duration: 2000,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        description: 'Failed to copy',
        variant: 'destructive',
        duration: 2000,
      });
    }
  }, [toast]);

  return { copiedId, copyToClipboard };
}
