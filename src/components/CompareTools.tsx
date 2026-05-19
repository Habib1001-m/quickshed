'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompareArrows, Search, X, Plus } from 'lucide-react';
import Fuse from 'fuse.js';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getAllTools, getToolById, getCategoryName, localize,
  type ToolDescriptor,
} from '@/lib/tool-utils';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MAX_COMPARE = 3;

interface CompareToolsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialToolId?: string;
}

export function CompareTools({ open, onOpenChange, initialToolId }: CompareToolsProps) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const allTools = useMemo(() => getAllTools(), []);

  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'keywords', weight: 1.5 },
          { name: 'category', weight: 1 },
        ],
        threshold: 0.4,
      }),
    [allTools]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return allTools.slice(0, 10);
    return fuse.search(searchQuery, { limit: 8 }).map((r) => r.item);
  }, [searchQuery, fuse, allTools]);

  const selectedTools = useMemo(() => {
    return selectedIds
      .map((id) => getToolById(id))
      .filter(Boolean) as ToolDescriptor[];
  }, [selectedIds]);

  const addTool = useCallback((toolId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(toolId) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, toolId];
    });
    setSearchQuery('');
    setSearchOpen(false);
  }, []);

  const removeTool = useCallback((toolId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== toolId));
  }, []);

  // Track previous initial tool ID to avoid re-adding
  const prevInitialRef = useRef<string | null>(null);

  // Reset selected tools when dialog closes
  useEffect(() => {
    if (!open) {
      requestAnimationFrame(() => {
        setSelectedIds([]);
      });
      prevInitialRef.current = null;
    }
  }, [open]);

  // Add initial tool when provided - use requestAnimationFrame to avoid sync setState in effect
  useEffect(() => {
    if (initialToolId && prevInitialRef.current !== initialToolId) {
      prevInitialRef.current = initialToolId;
      requestAnimationFrame(() => {
        setSelectedIds((prev) => {
          if (prev.includes(initialToolId) || prev.length >= MAX_COMPARE) return prev;
          return [...prev, initialToolId];
        });
      });
    }
  }, [initialToolId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto glass-strong"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="size-5 text-emerald-500" />
            {t('common.compareTools')}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? `حدد حتى ${MAX_COMPARE} أدوات للمقارنة جنباً إلى جنب`
              : `Select up to ${MAX_COMPARE} tools to compare side by side`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Tool selection */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground start-3" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder={t('common.selectToolToCompare')}
              className="ps-9"
            />
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full mt-1 inset-x-0 z-50 glass-strong rounded-xl border border-border/50 shadow-lg max-h-48 overflow-y-auto scrollbar-thin">
                {searchResults
                  .filter((tool) => !selectedIds.includes(tool.id))
                  .map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => addTool(tool.id)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-start"
                    >
                      <DynamicIcon name={tool.icon} className="size-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{localize(tool.name, locale)}</span>
                      <span className="text-xs text-muted-foreground ms-auto shrink-0">
                        {getCategoryName(tool.category, locale)}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Selected tools comparison */}
          {selectedTools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompareArrows className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm">{t('common.noToolsToCompare')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-start p-3 text-sm font-medium text-muted-foreground border-b w-32">
                      {' '}
                    </th>
                    {selectedTools.map((tool) => (
                      <th key={tool.id} className="p-3 border-b min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <DynamicIcon name={tool.icon} className="size-4" />
                          </div>
                          <span className="font-semibold text-foreground text-sm truncate">
                            {localize(tool.name, locale)}
                          </span>
                          <button
                            onClick={() => removeTool(tool.id)}
                            className="size-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                    {selectedTools.length < MAX_COMPARE && (
                      <th className="p-3 border-b min-w-[80px]">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 border-dashed border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            onClick={() => {
                              setSearchQuery('');
                              setSearchOpen(true);
                            }}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Category row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground border-b">
                      {t('common.compareCategory')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3 border-b">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(tool.category, locale)}
                        </Badge>
                      </td>
                    ))}
                    {selectedTools.length < MAX_COMPARE && <td className="border-b" />}
                  </tr>
                  {/* Privacy row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground border-b">
                      {t('common.comparePrivacy')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3 border-b">
                        <PrivacyBadge level={tool.privacy} />
                      </td>
                    ))}
                    {selectedTools.length < MAX_COMPARE && <td className="border-b" />}
                  </tr>
                  {/* Description row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground">
                      {t('common.compareDescription')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3">
                        <p className="text-sm text-foreground leading-relaxed">
                          {localize(tool.description, locale)}
                        </p>
                      </td>
                    ))}
                    {selectedTools.length < MAX_COMPARE && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
