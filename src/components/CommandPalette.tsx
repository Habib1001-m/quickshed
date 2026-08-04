'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  Search, Clock, Heart,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getAllTools, getCategoryName, localize, getToolById,
} from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { PrivacyBadge } from '@/components/PrivacyBadge';

export function CommandPalette() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const recentTools = useAppStore((s) => s.recentTools);
  const favorites = useAppStore((s) => s.favorites);
  const isRtl = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Build results list
  const results = useMemo(() => {
    if (query.trim()) {
      return fuse.search(query, { limit: 12 }).map((r) => r.item);
    }

    // Default view: recent + favorites
    const items: typeof allTools = [];
    const seen = new Set<string>();

    // Add favorites first
    favorites.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !seen.has(tool.id)) {
        items.push(tool);
        seen.add(tool.id);
      }
    });

    // Add recent tools
    recentTools.forEach((id) => {
      const tool = getToolById(id);
      if (tool && !seen.has(tool.id)) {
        items.push(tool);
        seen.add(tool.id);
      }
    });

    return items.slice(0, 12);
  }, [query, fuse, favorites, recentTools]);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to defer state updates out of the effect
      requestAnimationFrame(() => {
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      });
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        navigateToTool(results[selectedIndex].id);
        setIsOpen(false);
      }
    },
    [results, selectedIndex, navigateToTool]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={locale === 'ar' ? 'لوحة الأوامر' : 'Command palette'}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[15%] inset-x-0 z-[70] mx-auto w-full max-w-lg"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="glass-strong rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="size-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('home.heroSearchPlaceholder')}
                  aria-label={t('home.heroSearchPlaceholder')}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <kbd className="shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-2 scrollbar-thin">
                {!query.trim() && results.length > 0 && (
                  <div className="px-3 pb-1 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {favorites.length > 0
                        ? (locale === 'ar' ? 'المفضلة والمستخدمة مؤخراً' : 'Favorites & Recent')
                        : (locale === 'ar' ? 'المستخدمة مؤخراً' : 'Recently Used')
                      }
                    </span>
                  </div>
                )}

                {results.length === 0 && query.trim() && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Search className="size-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">{t('search.noResults')}</p>
                  </div>
                )}

                {results.map((tool, index) => {
                  const isSelected = index === selectedIndex;
                  const isFav = favorites.includes(tool.id);
                  const isRecent = recentTools.includes(tool.id);
                  
                  return (
                    <button
                      key={tool.id}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToTool(tool.id);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors duration-100
                        ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-muted/50'}
                      `}
                    >
                      <div className={`
                        flex size-9 shrink-0 items-center justify-center rounded-lg
                        transition-colors duration-100
                        ${isSelected ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}
                      `}>
                        <DynamicIcon name={tool.icon} className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate text-foreground">
                            {localize(tool.name, locale)}
                          </p>
                          {isFav && <Heart className="size-3 text-red-500 fill-red-500 shrink-0" />}
                          {isRecent && !isFav && <Clock className="size-3 text-muted-foreground shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {getCategoryName(tool.category, locale)}
                        </p>
                      </div>
                      <PrivacyBadge level={tool.privacy} />
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[9px]">↑</kbd>
                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[9px]">↓</kbd>
                    <span>{locale === 'ar' ? 'تنقل' : 'navigate'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[9px]">↵</kbd>
                    <span>{locale === 'ar' ? 'اختيار' : 'select'}</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[9px]">esc</kbd>
                  <span>{locale === 'ar' ? 'إغلاق' : 'close'}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
