'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Clock, Search, Trash2, Inbox, Wrench } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, localize, getAllTools } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getToolHistory,
  type ToolHistoryEntry,
} from '@/lib/tool-history';
import Fuse from 'fuse.js';

// ── Time helpers ──────────────────────────────────────────────────────

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(ts: number): boolean {
  const d = new Date(ts);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
}

function isThisWeek(ts: number): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return ts >= startOfWeek.getTime();
}

function relativeTime(ts: number, locale: string): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return locale === 'ar' ? 'الآن' : 'just now';
  if (minutes < 60) {
    const time = `${minutes} ${locale === 'ar' ? 'دقيقة' : 'min'}`;
    return time;
  }
  if (hours < 24) {
    const time = `${hours} ${locale === 'ar' ? 'ساعة' : 'hour'}`;
    return time;
  }
  if (days < 7) {
    const time = `${days} ${locale === 'ar' ? 'يوم' : 'day'}`;
    return time;
  }
  // Format as date
  return new Date(ts).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

function getDateGroup(ts: number): DateGroup {
  if (isToday(ts)) return 'today';
  if (isYesterday(ts)) return 'yesterday';
  if (isThisWeek(ts)) return 'thisWeek';
  return 'earlier';
}

const GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

const GROUP_LABEL_KEYS: Record<DateGroup, string> = {
  today: 'common.today',
  yesterday: 'common.yesterday',
  thisWeek: 'common.thisWeek',
  earlier: 'common.earlier',
};

// ── Animation variants ────────────────────────────────────────────────

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

// ── Component ─────────────────────────────────────────────────────────

export function ToolHistoryTimeline() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const isRtl = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);

  // Read history from localStorage lazily
  const [history, setHistory] = useState<ToolHistoryEntry[]>(() => {
    return getToolHistory();
  });

  // Poll for changes every 3 seconds
  useEffect(() => {
    const poll = () => {
      requestAnimationFrame(() => {
        setHistory(getToolHistory());
      });
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [historyVersion]);

  // Use Fuse.js for search
  const allTools = useMemo(() => getAllTools(), []);

  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'id', weight: 1.5 },
          { name: 'category', weight: 1 },
        ],
        threshold: 0.4,
      }),
    [allTools]
  );

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;

    // Search using fuse and match against history tool IDs
    const fuseResults = fuse.search(searchQuery, { limit: 50 });
    const matchingIds = new Set(fuseResults.map((r) => r.item.id));
    return history.filter((entry) => matchingIds.has(entry.toolId));
  }, [history, searchQuery, fuse]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<DateGroup, ToolHistoryEntry[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };
    for (const entry of filteredHistory) {
      groups[getDateGroup(entry.timestamp)].push(entry);
    }
    return groups;
  }, [filteredHistory]);

  const handleClearAll = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('quickshed-tool-history');
    } catch {
      // localStorage unavailable — still reset in-memory state below
    }
    setHistory([]);
    setHistoryVersion((v) => v + 1);
  };

  const hasEntries = history.length > 0;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-emerald-500" />
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {t('common.toolHistory')}
              </h2>
            </div>
            {hasEntries && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="size-3" />
                {t('common.clearAllHistory')}
              </Button>
            )}
          </div>

          {/* Search */}
          {hasEntries && (
            <div className="relative mb-4">
              <Search className="absolute top-1/2 -translate-y-1/2 size-4 start-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('common.searchHistory')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 glass-input rounded-xl h-9 text-sm"
              />
            </div>
          )}

          {/* Timeline or Empty State */}
          {!hasEntries ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                <Inbox className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {t('common.noHistory')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {t('common.noHistoryDesc')}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'لا توجد نتائج للبحث' : 'No results found'}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="wait">
                <motion.div
                  key={searchQuery}
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5"
                >
                  {GROUP_ORDER.map((group) => {
                    const entries = grouped[group];
                    if (entries.length === 0) return null;

                    return (
                      <div key={group}>
                        {/* Date group header */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                          {t(GROUP_LABEL_KEYS[group])}
                        </h3>

                        {/* Timeline items */}
                        <div className="relative ps-5" dir={isRtl ? 'rtl' : 'ltr'}>
                          {/* Vertical emerald timeline line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/20"
                            style={{ insetInlineStart: '7px' }}
                          />

                          <div className="space-y-2">
                            {entries.map((entry) => {
                              const tool = getToolById(entry.toolId);
                              if (!tool) return null;
                              const toolName = localize(tool.name, locale);

                              return (
                                <motion.button
                                  key={entry.id}
                                  variants={itemVariants}
                                  onClick={() => navigateToTool(entry.toolId)}
                                  className="relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-start hover:bg-emerald-500/5 transition-colors group"
                                >
                                  {/* Emerald dot on timeline */}
                                  <div
                                    className="absolute size-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm shadow-emerald-500/30"
                                    style={{ insetInlineStart: '-17px', top: '50%', transform: 'translateY(-50%)' }}
                                  />

                                  {/* Tool icon */}
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-emerald-500/10 transition-colors">
                                    <DynamicIcon name={tool.icon} className="size-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                  </div>

                                  {/* Tool name + time */}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {toolName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {relativeTime(entry.timestamp, locale)}
                                    </p>
                                  </div>

                                  {/* Wrench icon for visual flair */}
                                  <Wrench className="size-3.5 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors shrink-0" />
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
