'use client';

import { useState, useEffect } from 'react';
import { Keyboard, Command, Moon, Wrench, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ShortcutItem {
  keys: string[];
  action: string;
  category: 'navigation' | 'tools' | 'general';
  icon?: React.ReactNode;
}

export function KeyboardShortcutsPanel() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

  // Listen for custom event to open
  useEffect(() => {
    function handleOpenShortcuts() {
      setOpen(true);
    }
    window.addEventListener('quickshed-keyboard-shortcuts', handleOpenShortcuts);
    return () => window.removeEventListener('quickshed-keyboard-shortcuts', handleOpenShortcuts);
  }, []);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: ShortcutItem[] = [
    // Navigation
    { keys: [`${modKey}K`], action: t('common.shortcutCommandPalette'), category: 'navigation', icon: <Command className="size-3" /> },
    { keys: ['/'], action: t('common.shortcutFocusSearch'), category: 'navigation' },
    { keys: ['Esc'], action: t('common.shortcutEscape'), category: 'navigation' },
    { keys: ['←', '→'], action: t('common.shortcutArrowKeys'), category: 'navigation' },
    { keys: ['↑', '↓'], action: t('common.shortcutSearchResults'), category: 'navigation' },
    { keys: ['g', 'h'], action: t('common.shortcutGoHome'), category: 'navigation', icon: <Home className="size-3" /> },
    // Tools
    { keys: ['f'], action: t('common.shortcutToggleFavorite'), category: 'tools', icon: <Wrench className="size-3" /> },
    { keys: ['t'], action: t('common.shortcutLastTool'), category: 'tools' },
    { keys: ['s'], action: t('common.shortcutToggleSettings'), category: 'tools' },
    // General
    { keys: ['d'], action: t('common.shortcutToggleDarkMode'), category: 'general', icon: <Moon className="size-3" /> },
    { keys: ['?'], action: t('common.shortcutShowShortcuts'), category: 'general' },
  ];

  const categories = [
    { id: 'navigation' as const, label: t('common.shortcutsNavigation') },
    { id: 'tools' as const, label: t('common.shortcutsTools') },
    { id: 'general' as const, label: t('common.shortcutsGeneral') },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="glass-card border-border/50 sm:max-w-md"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Keyboard className="size-5 text-emerald-500" />
            {t('common.keyboardShortcuts')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {locale === 'ar'
              ? 'استخدم لوحة المفاتيح للتنقل بشكل أسرع'
              : 'Use keyboard shortcuts to navigate faster'}
          </DialogDescription>
        </DialogHeader>

        {/* Visual modifier key guide */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/40 border border-border/30">
          <span className="text-xs text-muted-foreground">
            {locale === 'ar' ? 'مفتاح التعديل:' : 'Modifier:'}
          </span>
          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-border bg-muted/80 text-[11px] font-mono font-medium text-foreground shadow-sm">
            {modKey}
          </kbd>
          <span className="text-xs text-muted-foreground">
            {isMac
              ? (locale === 'ar' ? '(ماك)' : '(Mac)')
              : (locale === 'ar' ? '(ويندوز/لينكس)' : '(Windows/Linux)')}
          </span>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
          {categories.map((category) => {
            const categoryShortcuts = shortcuts.filter((s) => s.category === category.id);
            if (categoryShortcuts.length === 0) return null;

            return (
              <div key={category.id} className="glass-card rounded-xl p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {category.label}
                  </h3>
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {categoryShortcuts.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        {shortcut.icon && <span className="text-muted-foreground">{shortcut.icon}</span>}
                        {shortcut.action}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            {i > 0 && (
                              <span className="text-muted-foreground text-xs mx-0.5">
                                {locale === 'ar' ? 'أو' : '/'}
                              </span>
                            )}
                            <kbd
                              className="
                                inline-flex items-center justify-center
                                min-w-[28px] h-7 px-2
                                rounded-md border border-border
                                bg-muted/80 text-[11px] font-mono font-medium text-foreground
                                shadow-sm
                              "
                            >
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
