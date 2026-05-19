'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Maximize2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, localize } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { getToolHistory } from '@/lib/tool-history';
import type { ToolDescriptor } from '@/lib/tool-utils';

const MAX_VISIBLE = 5;

export function QuickAccessBar() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const isRtl = locale === 'ar';
  const [isMinimized, setIsMinimized] = useState(false);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  // Poll tool history from localStorage
  useEffect(() => {
    const loadHistory = () => {
      const history = getToolHistory();
      // Get unique tool IDs (most recent first, deduplicated)
      const seen = new Set<string>();
      const uniqueIds: string[] = [];
      for (const entry of history) {
        if (!seen.has(entry.toolId)) {
          seen.add(entry.toolId);
          uniqueIds.push(entry.toolId);
        }
        if (uniqueIds.length >= MAX_VISIBLE) break;
      }
      setRecentToolIds(uniqueIds);
    };

    loadHistory();
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const recentTools = useMemo(() => {
    return recentToolIds
      .map((id) => getToolById(id))
      .filter(Boolean) as ToolDescriptor[];
  }, [recentToolIds]);

  // Don't show if no recent tools or on home view
  if (recentTools.length === 0) return null;

  return (
    <AnimatePresence>
      {isMinimized ? (
        // Minimized FAB
        <motion.button
          key="quick-access-fab"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 start-6 z-40 flex size-12 items-center justify-center rounded-full
            bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg
            hover:bg-emerald-500 hover:text-white hover:border-emerald-500
            transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label={t('common.quickAccess')}
        >
          <Maximize2 className="size-5" />
        </motion.button>
      ) : (
        // Full bar
        <motion.div
          key="quick-access-bar"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-0 inset-x-0 z-40 border-t border-border/40 bg-background/80 backdrop-blur-xl"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              {/* Label */}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground shrink-0 me-3">
                {t('common.quickAccess')}
              </span>

              {/* Tool icons */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                <AnimatePresence>
                  {recentTools.map((tool, index) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      onClick={() => navigateToTool(tool.id)}
                      className="group relative flex size-9 items-center justify-center rounded-full
                        bg-muted/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40
                        transition-colors duration-200 shrink-0
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      aria-label={localize(tool.name, locale)}
                    >
                      <DynamicIcon name={tool.icon} className="size-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md z-50">
                        {localize(tool.name, locale)}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Minimize button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="flex size-7 items-center justify-center rounded-full
                  text-muted-foreground hover:text-foreground hover:bg-muted
                  transition-colors duration-200 shrink-0 ms-2
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={t('common.minimize')}
              >
                <Minimize2 className="size-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
