'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Search, ArrowUp, LayoutGrid } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

interface FabAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function FloatingActionButton() {
  const { t, locale } = useI18n();
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);

  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show FAB after scrolling down 300px
  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [expanded]);

  const handleSearch = useCallback(() => {
    setExpanded(false);
    window.dispatchEvent(new CustomEvent('quickshed-command-palette'));
  }, []);

  const handleBackToTop = useCallback(() => {
    setExpanded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAllTools = useCallback(() => {
    setExpanded(false);
    navigateToAllTools();
  }, [navigateToAllTools]);

  const actions: FabAction[] = [
    { icon: <Search className="size-4" />, label: t('common.fabSearch'), onClick: handleSearch },
    { icon: <ArrowUp className="size-4" />, label: t('common.fabBackToTop'), onClick: handleBackToTop },
    { icon: <LayoutGrid className="size-4" />, label: t('common.fabAllTools'), onClick: handleAllTools },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={containerRef}
          className="relative flex flex-col items-center gap-6"
          data-testid="floating-quick-actions-root"
        >
          {/* Expanded menu items */}
          <AnimatePresence>
            {expanded && (
              <motion.div className="flex flex-col items-center gap-2">
                {actions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.4, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.4, y: 20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                      delay: (actions.length - 1 - index) * 0.05,
                    }}
                    onClick={action.onClick}
                    data-testid="floating-action-item"
                    className={`
                      group relative flex size-11 items-center justify-center rounded-full
                      bg-background/80 backdrop-blur-lg border border-border/50
                      shadow-lg text-foreground
                      hover:bg-emerald-500 hover:text-white hover:border-emerald-500
                      transition-colors duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                      micro-bounce
                    `}
                    aria-label={action.label}
                  >
                    {action.icon}
                    {/* Tooltip label */}
                    <span
                      className={`
                        absolute ${locale === 'ar' ? 'left-full ml-2' : 'right-full mr-2'}
                        max-w-[calc(100vw-6rem)] truncate whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none shadow-md
                      `}
                    >
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={t('common.quickAccess')}
            aria-expanded={expanded}
            data-testid="floating-quick-actions"
            className={`
              flex size-14 items-center justify-center rounded-full
              shadow-xl backdrop-blur-lg border border-border/30
              transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
              micro-bounce
              ${expanded
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 rotate-45'
                : 'bg-emerald-500 text-white shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-emerald-500/40'
              }
            `}
          >
            <Wrench className="size-6" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
