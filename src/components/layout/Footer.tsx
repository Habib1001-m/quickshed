'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Shield, Home, Grid3X3, Wrench, FileText, Scale, Github, Twitter, Heart,
  ArrowUp, Zap, Lock, LayoutGrid, Mail, Star,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getCategories, localize, getAllTools } from '@/lib/tool-utils';
import type { Locale } from '@/lib/store';

export default function Footer() {
  const { t, locale } = useI18n();
  const navigateHome = useAppStore((s) => s.navigateHome);
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);
  const navigateToFavorites = useAppStore((s) => s.navigateToFavorites);
  const favorites = useAppStore((s) => s.favorites);

  const isRTL = locale === 'ar';
  const categories = useMemo(() => getCategories(), []);
  const allTools = useMemo(() => getAllTools(), []);
  const localTools = allTools.filter((t) => t.privacy === 'local').length;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="mt-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Wave SVG pattern - more elegant with gradient */}
      <div className="relative h-16 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="footer-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.65 0.18 163 / 15%)" />
              <stop offset="50%" stopColor="oklch(0.60 0.12 185 / 20%)" />
              <stop offset="100%" stopColor="oklch(0.65 0.18 163 / 15%)" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C150,100 350,0 600,50 C850,100 1050,10 1200,40 L1200,120 L0,120 Z"
            fill="url(#footer-wave-gradient)"
          />
          <path
            d="M0,60 C200,110 400,20 600,70 C800,110 1000,30 1200,60 L1200,120 L0,120 Z"
            fill="oklch(0.27 0.02 261 / 40%)"
          />
        </svg>
      </div>

      <div className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ─── Stats Bar ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-b border-border/50">
            <div className="stat-card footer-stat-lift flex flex-col items-center gap-2 text-center rounded-2xl p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Wrench className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{allTools.length}+</p>
                <p className="text-xs text-muted-foreground font-medium">{locale === 'ar' ? 'أداة مجانية' : 'Free Tools'}</p>
              </div>
            </div>
            <div className="stat-card footer-stat-lift flex flex-col items-center gap-2 text-center rounded-2xl p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                <LayoutGrid className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{categories.length}</p>
                <p className="text-xs text-muted-foreground font-medium">{locale === 'ar' ? 'فئة' : 'Categories'}</p>
              </div>
            </div>
            <div className="stat-card footer-stat-lift flex flex-col items-center gap-2 text-center rounded-2xl p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">100%</p>
                <p className="text-xs text-muted-foreground font-medium">{locale === 'ar' ? 'مجاني' : 'Free'}</p>
              </div>
            </div>
            <div className="stat-card footer-stat-lift flex flex-col items-center gap-2 text-center rounded-2xl p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{localTools}%</p>
                <p className="text-xs text-muted-foreground font-medium">{locale === 'ar' ? 'محلي' : 'Local'}</p>
              </div>
            </div>
          </div>

          {/* ─── Newsletter Coming Soon ──────────────────────────────── */}
          <div className="py-8 border-b border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {locale === 'ar' ? 'النشرة البريدية — قريباً' : 'Newsletter — Coming Soon'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar'
                      ? 'سنعلمك بالأدوات الجديدة قريباً. ابقَ على اطلاع!'
                      : 'We\'ll notify you when new tools drop. Stay tuned!'
                    }
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 coming-soon-shimmer">
                {locale === 'ar' ? '🚀 قريباً' : '🚀 Coming Soon'}
              </span>
            </div>
          </div>

          {/* ─── Footer Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-10">
            {/* ─── Brand + Privacy ────────────────────────────── */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  {t('site.name')}
                </span>
              </div>

              {/* Privacy card - subtle emerald gradient background */}
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-emerald-100/60 to-emerald-50 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-emerald-950/30 p-4 card-elevated privacy-card-border-pulse">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      {t('footer.privacyPromise')}
                    </p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-1 leading-relaxed">
                      {t('footer.privacyPromiseDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                {t('site.description')}
              </p>
            </div>

            {/* ─── Quick Links ───────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t('footer.quickLinks')}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={navigateHome}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    <Home className="h-3.5 w-3.5" />
                    {t('header.home')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (categories.length > 0) {
                        navigateToCategory(categories[0].slug);
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                    {t('header.categories')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={navigateToAllTools}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    {t('footer.allTools')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={navigateToFavorites}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <Star className="h-3.5 w-3.5" />
                    {locale === 'ar' ? 'المفضلة' : 'Favorites'}
                    {favorites.length > 0 && (
                      <span className="text-[10px] font-bold text-red-500">({favorites.length})</span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* ─── Categories ────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t('header.categories')}
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => navigateToCategory(cat.slug)}
                      className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                    >
                      {localize(cat.name, locale as Locale)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Legal + Social ────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t('footer.legal')}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {t('footer.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    {t('footer.termsOfService')}
                  </Link>
                </li>
              </ul>

              {/* Social links - larger with better hover */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {t('footer.connect')}
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/quickshed"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="flex size-11 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground
                      hover:bg-foreground hover:text-background hover:scale-110 hover:shadow-lg hover:shadow-foreground/20 transition-all duration-300 micro-bounce"
                  >
                    <Github className="size-5" />
                  </a>
                  <a
                    href="https://x.com/quickshed"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="flex size-11 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground
                      hover:bg-foreground hover:text-background hover:scale-110 hover:shadow-lg hover:shadow-foreground/20 transition-all duration-300 micro-bounce"
                  >
                    <Twitter className="size-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Bottom Bar ────────────────────────────────────────── */}
          <div className="relative py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <p className="text-xs text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleScrollToTop}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-500 transition-colors micro-bounce"
              >
                <ArrowUp className="size-3" />
                {locale === 'ar' ? 'العودة للأعلى' : 'Back to top'}
              </button>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {t('footer.madeWith')} <Heart className="size-3 text-emerald-500 fill-emerald-500" /> {t('footer.builtForPrivacy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
