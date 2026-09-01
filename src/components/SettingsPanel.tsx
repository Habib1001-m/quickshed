'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, X, Globe, Moon, Sun, Trash2, Heart, Clock,
  Shield, Wrench, RotateCcw, Compass,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/version';
import { Button } from '@/components/ui/button';
import { getAllTools, isOnDevice } from '@/lib/tool-utils';
import { requestOnboardingStart } from '@/lib/onboarding-steps';
import { ExportImport } from '@/components/ExportImport';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t, locale } = useI18n();
  const { theme, setTheme } = useTheme();
  const setLocale = useAppStore((s) => s.setLocale);
  const favorites = useAppStore((s) => s.favorites);
  const recentTools = useAppStore((s) => s.recentTools);
  const clearRecentTools = useAppStore((s) => s.clearRecentTools);

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const isRtl = locale === 'ar';

  const allTools = getAllTools();
  // On-device = local + file-only + storage. Counting only
  // `local` and labelling it "Local" understates the on-device baseline; use
  // the shared classifier so the metric matches Footer and the contract.
  const onDeviceCount = allTools.filter((t) => isOnDevice(t.privacy)).length;

  const handleClearAll = () => {
    // Clear All Data: wipe every QuickShed localStorage key (app + tool data:
    // url-shortener, notes, habits, emoji, history, ratings, collections,
    // compare, usage, recent, favorites, etc.). Defensive if localStorage is
    // unavailable. Snapshot matching keys first, then remove, so we never
    // mutate localStorage while iterating it.
    try {
      const quickshedKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quickshed-')) quickshedKeys.push(key);
      }
      quickshedKeys.forEach((key) => localStorage.removeItem(key));
    } catch {
      // localStorage unavailable — fall through to in-memory reset below
    }

    // Reset the in-memory app-store collections so the UI doesn't retain the
    // deleted data. Use setState directly: the store actions re-persist to
    // localStorage, which would recreate the keys we just removed.
    useAppStore.setState({
      favorites: [],
      recentTools: [],
      toolUsageCount: {},
      collections: [],
      compareToolIds: [],
    });

    setShowConfirmClear(false);

    // Reload so every mounted tool component reinitializes without the deleted
    // browser-storage state. Browser-local; SSR-guarded.
    if (typeof window !== 'undefined') window.location.reload();
  };

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
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: isRtl ? -320 : 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? -320 : 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} z-[70] h-full w-80 glass-strong border-${isRtl ? 'r' : 'l'} border-border/50 shadow-2xl`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <Settings className="size-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-foreground">
                    {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={onClose}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto py-4 px-5 space-y-6 scrollbar-thin">
                {/* Language */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'اللغة' : 'Language'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLocale('en')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        locale === 'en'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Globe className="size-4" />
                      English
                    </button>
                    <button
                      onClick={() => setLocale('ar')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        locale === 'ar'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Globe className="size-4" />
                      عربي
                    </button>
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'المظهر' : 'Theme'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        theme === 'light'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Sun className="size-4" />
                      {locale === 'ar' ? 'فاتح' : 'Light'}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Moon className="size-4" />
                      {locale === 'ar' ? 'داكن' : 'Dark'}
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'الإحصائيات' : 'Statistics'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <Wrench className="size-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-foreground">{allTools.length}</p>
                      <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'أداة' : 'Tools'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <Heart className="size-5 text-red-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-foreground">{favorites.length}</p>
                      <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'مفضلة' : 'Favorites'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <Clock className="size-5 text-sky-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-foreground">{recentTools.length}</p>
                      <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'مستخدمة مؤخراً' : 'Recent'}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <Shield className="size-5 text-violet-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-foreground">{onDeviceCount}</p>
                      <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'على الجهاز' : 'On-device'}</p>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'إدارة البيانات' : 'Data Management'}
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                      onClick={clearRecentTools}
                    >
                      <RotateCcw className="size-3.5" />
                      {locale === 'ar' ? 'مسح السجل' : 'Clear History'}
                    </Button>
                    
                    {!showConfirmClear ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50"
                        onClick={() => setShowConfirmClear(true)}
                      >
                        <Trash2 className="size-3.5" />
                        {locale === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-3">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                          {locale === 'ar' ? 'هل أنت متأكد؟ سيتم حذف جميع بيانات التطبيق والأدوات المحفوظة.' : 'Are you sure? All saved app and tool data will be deleted.'}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 text-xs"
                            onClick={handleClearAll}
                          >
                            {locale === 'ar' ? 'نعم، مسح' : 'Yes, Clear'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-xs"
                            onClick={() => setShowConfirmClear(false)}
                          >
                            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding Tour */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'الجولة التعريفية' : 'Guided Tour'}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50"
                    onClick={() => {
                      onClose();
                      requestOnboardingStart();
                    }}
                  >
                    <Compass className="size-3.5" />
                    {t('common.restartTour')}
                  </Button>
                </div>

                {/* Export / Import */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'نسخ احتياطي' : 'Backup'}
                  </h3>
                  <ExportImport />
                </div>

                {/* About */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {locale === 'ar' ? 'حول' : 'About'}
                  </h3>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50 p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <Wrench className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">QuickShed</p>
                        <p className="text-[11px] text-muted-foreground">v{APP_VERSION}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {locale === 'ar' 
                        ? 'صندوق أدوات مجاني يحترم خصوصيتك. جميع الأدوات تعمل محلياً في متصفحك.'
                        : 'Your free privacy-first toolbox. All tools run locally in your browser.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
