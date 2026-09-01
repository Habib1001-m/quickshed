'use client';

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  Shield, Gift, Globe, UserX, Search, ArrowRight,
  Wrench, LayoutGrid, Heart, Lock, Clock, X,
  Sparkles, Zap, ChevronRight, Star,
  FileLock2, Database, ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getCategories, getDiverseFeaturedTools, getAllTools,
  getToolById, localize, getCategoryName,
  type ToolDescriptor, type Privacy,
} from '@/lib/tool-utils';
import { ToolCard } from '@/components/ToolCard';
import { DynamicIcon } from '@/components/IconMapper';
import { DidYouKnowTip } from '@/components/DidYouKnowTip';
import { ToolCollections } from '@/components/ToolCollections';
import { UsageDashboard } from '@/components/UsageDashboard';
import { ToolHistoryTimeline } from '@/components/ToolHistoryTimeline';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from '@/lib/category-config';

// ─── Feature card data ──────────────────────────────────────────────

const FEATURES = [
  {
    icon: Shield,
    titleKey: 'home.privacyFirst',
    descKey: 'home.privacyFirstDesc',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10',
    accent: 'emerald',
    number: '01',
  },
  {
    icon: Gift,
    titleKey: 'home.freeForever',
    descKey: 'home.freeForeverDesc',
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    ring: 'ring-sky-200 dark:ring-sky-800',
    gradient: 'from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/10',
    accent: 'sky',
    number: '02',
  },
  {
    icon: Globe,
    titleKey: 'home.bilingual',
    descKey: 'home.bilingualDesc',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    ring: 'ring-violet-200 dark:ring-violet-800',
    gradient: 'from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/10',
    accent: 'violet',
    number: '03',
  },
  {
    icon: UserX,
    titleKey: 'home.noAccount',
    descKey: 'home.noAccountDesc',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    ring: 'ring-orange-200 dark:ring-orange-800',
    gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10',
    accent: 'orange',
    number: '04',
  },
] as const;

const ACCENT_BORDER_COLORS: Record<string, string> = {
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  orange: '#f97316',
};

// ─── Stats items (values computed dynamically inside component) ──

const STATS_CONFIG = [
  { key: 'home.statsTools', icon: Wrench, type: 'tools' as const },
  { key: 'home.statsCategories', icon: LayoutGrid, type: 'categories' as const },
  { key: 'home.statsFree', icon: Heart, type: 'free' as const },
  { key: 'home.statsPrivacy', icon: Lock, type: 'privacy' as const },
];

// ─── Category example tools ────────────────────────────────────────

const CATEGORY_EXAMPLES: Record<string, { en: string; ar: string }[]> = {
  calculators: [
    { en: 'Basic Calculator', ar: 'آلة حاسبة أساسية' },
    { en: 'Loan Calculator', ar: 'حاسبة القروض' },
    { en: 'BMI Calculator', ar: 'حاسبة مؤشر كتلة الجسم' },
  ],
  'time-tools': [
    { en: 'Stopwatch', ar: 'ساعة إيقاف' },
    { en: 'Countdown Timer', ar: 'مؤقت تنازلي' },
    { en: 'World Clock', ar: 'ساعة عالمية' },
  ],
  'text-tools': [
    { en: 'Word Counter', ar: 'عداد الكلمات' },
    { en: 'Case Converter', ar: 'محول الحالة' },
    { en: 'Slug Generator', ar: 'مولد الرابط الودي' },
  ],
  converters: [
    { en: 'Unit Converter', ar: 'محول الوحدات' },
    { en: 'Temperature Converter', ar: 'محول درجة الحرارة' },
    { en: 'Color Converter', ar: 'محول الألوان' },
  ],
  'student-tools': [
    { en: 'GPA Calculator', ar: 'حاسبة المعدل التراكمي' },
    { en: 'Flashcard Maker', ar: 'صانع البطاقات التعليمية' },
    { en: 'Citation Generator', ar: 'مولد الاستشهادات' },
  ],
  'pdf-tools': [
    { en: 'PDF Merger', ar: 'دمج ملفات PDF' },
    { en: 'PDF to Text', ar: 'PDF إلى نص' },
  ],
  'utility-tools': [
    { en: 'Password Generator', ar: 'مولد كلمات المرور' },
    { en: 'QR Code Generator', ar: 'مولد رمز QR' },
    { en: 'Color Picker', ar: 'منتقي الألوان' },
  ],
  'seo-tools': [
    { en: 'Meta Tag Generator', ar: 'مولد العلامات الوصفية' },
    { en: 'SERP Simulator', ar: 'محاكي نتائج البحث' },
  ],
  'developer-tools': [
    { en: 'JSON Formatter', ar: 'منسق JSON' },
    { en: 'JWT Decoder', ar: 'فاك تشفير JWT' },
    { en: 'Base64 Encoder', ar: 'مشفر Base64' },
  ],
  'image-tools': [
    { en: 'Image Resizer', ar: 'تغيير حجم الصور' },
    { en: 'Image Cropper', ar: 'قص الصور' },
  ],
  'security-tools': [
    { en: 'SSL Checker', ar: 'مدقق SSL' },
    { en: 'Password Strength', ar: 'قوة كلمة المرور' },
  ],
};

// ─── Animation variants ─────────────────────────────────────────────

/**
 * Exhaustive four-way spotlight disclosure. Every Privacy
 * value resolves to its own label key — on-device classes (`local`,
 * `file-only`, `storage`) never say `requiresConnection`. The switch is
 * exhaustive over the shared {@link Privacy} union; a future value fails
 * typecheck (the function must return on every path).
 */
function spotlightPrivacyLabelKey(privacy: Privacy): string {
  switch (privacy) {
    case 'local':
      return 'home.localProcessing';
    case 'file-only':
      return 'home.processesFileLocally';
    case 'storage':
      return 'home.savedOnDevice';
    case 'api':
      return 'home.requiresConnection';
  }
}

/**
 * Exhaustive four-way spotlight icon + hue. Every Privacy
 * value resolves to its own icon and color; on-device classes (`local`,
 * `file-only`, `storage`) never fall through to the API amber. Typed
 * `Record<Privacy, ...>` so a future enum value fails typecheck until added.
 */
const SPOTLIGHT_PRIVACY_ICON: Record<Privacy, { Icon: LucideIcon; color: string }> = {
  local: { Icon: Shield, color: 'text-emerald-500' },
  'file-only': { Icon: FileLock2, color: 'text-sky-500' },
  storage: { Icon: Database, color: 'text-violet-500' },
  api: { Icon: ShieldAlert, color: 'text-amber-500' },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

// Category colors are now imported from @/lib/category-config

// ─── Animated Number Counter ────────────────────────────────────────

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const stepValue = value / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += stepValue;
            if (current >= value) {
              setCount(value);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="animate-count-up tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ─── HomeView Component ─────────────────────────────────────────────

export function HomeView() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);
  const recentTools = useAppStore((s) => s.recentTools);
  const clearRecentTools = useAppStore((s) => s.clearRecentTools);
  const favorites = useAppStore((s) => s.favorites);
  const collections = useAppStore((s) => s.collections);
  const isRtl = locale === 'ar';

  // Data
  const categories = useMemo(() => getCategories(), []);
  const featuredTools = useMemo(() => getDiverseFeaturedTools(8), []);
  const spotlightTool = useMemo(() => getDiverseFeaturedTools(1)[0], []);
  // Exhaustive four-way spotlight icon + hue; guarded so
  // SSR and a missing spotlight tool stay safe.
  const SpotlightPrivacy = spotlightTool
    ? SPOTLIGHT_PRIVACY_ICON[spotlightTool.privacy]
    : null;

  // Hero search
  const allTools = useMemo(() => getAllTools(), []);

  // Dynamic stats computed from actual data
  const stats = useMemo(() => {
    const toolsCount = allTools.length;
    const categoriesCount = categories.length;
    return STATS_CONFIG.map((s) => ({
      ...s,
      value: s.type === 'tools' ? toolsCount : s.type === 'categories' ? categoriesCount : 100,
    }));
  }, [allTools, categories]);

  // Resolve recent tool descriptors
  const recentToolDescriptors = useMemo(() => {
    return recentTools
      .map((id) => getToolById(id))
      .filter((t): t is ToolDescriptor => t !== undefined);
  }, [recentTools]);

  // Resolve favorite tool descriptors
  const favoriteToolDescriptors = useMemo(() => {
    return favorites
      .map((id) => getToolById(id))
      .filter((t): t is ToolDescriptor => t !== undefined);
  }, [favorites]);

  // Hero search state
  const [heroQuery, setHeroQuery] = useState('');
  const [heroResults, setHeroResults] = useState<typeof allTools>([]);
  const [heroSearchOpen, setHeroSearchOpen] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const heroDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'keywords', weight: 1.5 },
          { name: 'category', weight: 1 },
          { name: 'description.en', weight: 0.5 },
          { name: 'description.ar', weight: 0.5 },
        ],
        threshold: 0.4,
      }),
    [allTools]
  );

  const handleHeroSearch = useCallback(
    (value: string) => {
      setHeroQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setHeroResults([]);
        setHeroSearchOpen(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        const results = fuse.search(value, { limit: 6 });
        setHeroResults(results.map((r) => r.item));
        setHeroSearchOpen(true);
      }, 150);
    },
    [fuse]
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        heroDropdownRef.current &&
        !heroDropdownRef.current.contains(e.target as Node) &&
        heroInputRef.current &&
        !heroInputRef.current.contains(e.target as Node)
      ) {
        setHeroSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden mesh-gradient" data-onboarding="welcome">
        {/* Radial glow accent */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] blur-3xl pointer-events-none" />

        {/* Floating geometric shapes - reduced opacity by 50% */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] start-[8%] w-16 h-16 rounded-2xl bg-emerald-500/4 dark:bg-emerald-400/3 animate-float-slow" />
          <div className="absolute top-[25%] end-[12%] w-12 h-12 rounded-full bg-sky-500/4 dark:bg-sky-400/3 animate-float-reverse" />
          <div className="absolute top-[60%] start-[5%] w-10 h-10 rounded-lg bg-violet-500/4 dark:bg-violet-400/3 animate-float" />
          <div className="absolute top-[70%] end-[8%] w-20 h-20 rounded-3xl bg-emerald-500/3 dark:bg-emerald-400/2 animate-spin-slow" />
          <div className="absolute top-[40%] end-[30%] w-8 h-8 rounded-full bg-orange-500/4 dark:bg-orange-400/3 animate-float-slow" />
        </div>

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Animated border line below hero */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center text-center"
          >
            {/* QuickShed badge - more prominent with glow/pulse + floating micro-animation */}
            <motion.div variants={fadeUp} custom={0} className="hero-badge-float">
              <span className="floating-label text-sm font-bold shadow-lg shadow-emerald-500/15 dark:shadow-emerald-500/25 px-4 py-1.5 gap-2">
                <span className="size-3 rounded-full bg-emerald-500 animate-pulse-ring" />
                <AnimatedCounter value={allTools.length} suffix="+ " />
                {t('home.statsTools', { count: '' }).replace(/\d+\+?\s*/, '')}
              </span>
            </motion.div>

            {/* Title with shimmer gradient animation */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl hero-title-shimmer"
            >
              {t('home.heroTitle')}
            </motion.h1>

            {/* Subtitle - improved contrast */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl leading-relaxed"
            >
              {t('home.heroSubtitle')}
            </motion.p>

            {/* Search bar - hero-search-input with emerald glow focus */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 w-full max-w-xl relative"
              data-onboarding="search"
            >
              <Search className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 start-4 transition-colors duration-300 ${heroFocused ? 'text-emerald-500 search-icon-pulse' : 'text-muted-foreground'}`} />
              <Input
                ref={heroInputRef}
                type="text"
                placeholder={t('home.heroSearchPlaceholder')}
                value={heroQuery}
                onChange={(e) => handleHeroSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && heroResults.length > 0) {
                    navigateToTool(heroResults[0].id);
                    setHeroQuery('');
                    setHeroResults([]);
                    setHeroSearchOpen(false);
                  }
                }}
                onFocus={() => {
                  setHeroFocused(true);
                  if (heroResults.length > 0) setHeroSearchOpen(true);
                }}
                onBlur={() => setHeroFocused(false)}
                className={`
                  ps-14 pe-20 h-16 text-base rounded-2xl hero-search-input search-border-animate
                  placeholder:text-foreground/40 dark:placeholder:text-foreground/50
                `}
              />
              {/* Press Enter hint + result count animation */}
              {heroFocused && heroResults.length > 0 && (
                <span className="absolute top-1/2 -translate-y-1/2 end-4 flex items-center gap-2 pointer-events-none">
                  <span className="result-count-animate inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {heroResults.length}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground/60 bg-muted/60 px-2 py-1 rounded-md">
                    ↵ Enter
                  </span>
                </span>
              )}

              {/* Search dropdown */}
              {heroSearchOpen && heroResults.length > 0 && (
                <div
                  ref={heroDropdownRef}
                  className="absolute top-full mt-2 inset-x-0 glass-strong rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="max-h-72 overflow-y-auto">
                    {heroResults.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          navigateToTool(tool.id);
                          setHeroQuery('');
                          setHeroResults([]);
                          setHeroSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-emerald-500/10 transition-colors"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <DynamicIcon name={tool.icon} className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate text-foreground">
                            {localize(tool.name, locale)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {getCategoryName(tool.category, locale)}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground shrink-0 rtl:rotate-180" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Stats row with enhanced stat-card class */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-5"
            >
              {stats.map((stat, i) => (
                <div key={stat.key} className="stat-card flex flex-col items-center gap-2 rounded-2xl px-6 py-5 min-w-[120px]">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                    <stat.icon className="size-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="hero-stat-number stat-number-pulse">
                    <AnimatedCounter value={stat.value} suffix={i >= 2 ? '%' : '+'} />
                  </span>
                  <span className="hero-stat-label">{t(stat.key)}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section with enhanced cards ───────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold gradient-text section-heading">
              {t('home.whyQuickShed')}
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.titleKey}
                variants={fadeUp}
                custom={i}
                style={{ borderTopWidth: '4px', borderTopColor: ACCENT_BORDER_COLORS[feature.accent] || '#10b981' }}
                className={`
                  group relative flex flex-col items-center text-center gap-4 rounded-2xl
                  glass-card feature-card bg-gradient-to-br ${feature.gradient} bg-card p-8 md:p-10
                  transition-all duration-300
                  hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10
                  hover:border-emerald-500/20 dark:hover:border-emerald-500/10
                  overflow-hidden
                `}
              >
                {/* Watermark number indicator */}
                <span className="absolute top-3 end-4 text-6xl font-black text-foreground/[0.08] dark:text-foreground/[0.08] select-none leading-none">
                  {feature.number}
                </span>

                {/* Decorative corner accent */}
                <div className={`absolute top-0 end-0 w-20 h-20 bg-${feature.accent}-500/5 dark:bg-${feature.accent}-400/5 rounded-bl-3xl`} />

                {/* Animated icon - size-18 */}
                <div
                  className={`
                    relative flex size-18 items-center justify-center rounded-full ring-2 ${feature.color} ${feature.ring}
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                    group-hover:shadow-lg group-hover:shadow-${feature.accent}-500/20
                  `}
                >
                  <feature.icon className="size-9 transition-transform duration-500 group-hover:scale-110" />
                  {/* Pulse ring on hover */}
                  <div className={`absolute inset-0 rounded-full ring-2 ring-${feature.accent}-500/0 transition-all duration-500 group-hover:ring-${feature.accent}-500/30 group-hover:scale-125`} />
                </div>
                <h3 className="text-lg font-bold text-card-foreground relative z-10">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground relative z-10">
                  {t(feature.descKey)}
                </p>
                {/* Decorative gradient bottom accent */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Did You Know Tips ────────────────────────────────────── */}
      <DidYouKnowTip />

      {/* ─── Usage Dashboard ─────────────────────────────────────── */}
      <UsageDashboard />

      {/* ─── Smart Recommendations ───────────────────────────── */}
      <SmartRecommendations />

      {/* ─── Tool History Timeline ──────────────────────────────── */}
      <ToolHistoryTimeline />

      {/* ─── Recently Used Section ─────────────────────────────────── */}
      {recentToolDescriptors.length > 0 && (
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-muted-foreground" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  {t('home.recentlyUsed')}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentTools}
                className="text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="size-3" />
                {t('home.clearHistory')}
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentToolDescriptors.map((tool) => {
                const colorClass = getCategoryColor(tool.category).icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => navigateToTool(tool.id)}
                    className="flex items-center gap-2.5 shrink-0 rounded-lg border border-border bg-card px-3 py-2 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:border-emerald-500/30 cursor-pointer"
                  >
                    <div className={`flex size-8 items-center justify-center rounded-md ${colorClass}`}>
                      <DynamicIcon name={tool.icon} className="size-4" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                      {localize(tool.name, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Favorite Tools Section ────────────────────────────────── */}
      {favoriteToolDescriptors.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="size-5 text-red-500 fill-red-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('home.yourFavorites')}
              </h2>
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {favoriteToolDescriptors.map((tool, i) => (
                <motion.div key={tool.id} variants={fadeUp} custom={i}>
                  <ToolCard tool={tool} showCategoryAccent />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Collections Section ───────────────────────────────────── */}
      {collections.length > 0 && <ToolCollections />}

      {/* ─── Categories Section ────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-muted/30" data-onboarding="categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 data-onboarding="categories-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {t('home.allCategories')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('home.browseByCategory')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
          >
            {categories.map((category, i) => {
              const examples = CATEGORY_EXAMPLES[category.slug] || [];
              const exampleNames = examples.map((ex) => ex[locale === 'ar' ? 'ar' : 'en']);
              return (
                <motion.div key={category.slug} variants={fadeUp} custom={i}>
                  <EnhancedCategoryCard category={category} examples={exampleNames} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* View All Tools button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <Button
              onClick={navigateToAllTools}
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-8 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 micro-bounce"
            >
              {t('home.viewAllTools')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Tool Spotlight Section ──────────────────────────────── */}
      {spotlightTool && (
        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-6"
            >
              <Star className="size-5 text-emerald-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('home.toolSpotlight')}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl glass-card gradient-border overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-sky-500/5 pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                {/* Large animated icon with floating animation */}
                <div className="relative shrink-0 icon-float">
                  <div className="flex size-24 md:size-28 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-xl animate-pulse-ring">
                    <DynamicIcon name={spotlightTool.icon} className="size-12 md:size-14" />
                  </div>
                  <div className="absolute -top-1 -end-1 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                    <Sparkles className="size-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-start">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {localize(spotlightTool.name, locale)}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">
                    {localize(spotlightTool.description, locale)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <Button
                      onClick={() => navigateToTool(spotlightTool.id)}
                      size="lg"
                      className="gap-2 rounded-full px-10 h-13 text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 micro-bounce glow-focus"
                    >
                      <Zap className="size-5" />
                      {t('home.tryNow')}
                    </Button>
                    {SpotlightPrivacy ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <SpotlightPrivacy.Icon className={`size-3.5 ${SpotlightPrivacy.color}`} />
                        {t(spotlightPrivacyLabelKey(spotlightTool.privacy))}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Featured Tools Section ────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('home.featuredTools')}
            </h2>
            <button
              onClick={navigateToAllTools}
              className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {t('home.viewAllTools')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {featuredTools.map((tool, i) => (
              <motion.div key={tool.id} variants={fadeUp} custom={i}>
                <ToolCard tool={tool} showCategoryAccent />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative overflow-hidden mesh-gradient">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto glass-card-stronger card-elevated rounded-3xl p-10 md:p-14"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 mb-6 animate-pulse-ring">
              <Zap className="size-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('home.readyToStart')}
            </h2>
            <div className="mt-6">
              <Button
                onClick={() => {
                  navigateToAllTools();
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                size="lg"
                className="gap-2 rounded-full px-12 h-14 text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 micro-bounce glow-focus"
              >
                <Search className="size-5" />
                {t('home.searchCTA')}
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="size-4 text-emerald-500" />
              <span>{t('home.privacyFirstDesc')}</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─── Enhanced Category Card with examples ───────────────────────────

interface EnhancedCategoryCardProps {
  category: ReturnType<typeof getCategories>[0];
  examples: string[];
}

// Category colors are now imported from @/lib/category-config

function EnhancedCategoryCard({ category, examples }: EnhancedCategoryCardProps) {
  const { t, locale } = useI18n();
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);

  const categoryName = localize(category.name, locale);
  const toolCountLabel = t('home.toolCount', { count: category.toolCount });
  const isRtl = locale === 'ar';

  const handleClick = () => {
    navigateToCategory(category.slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToCategory(category.slug);
    }
  };

  const colors = getCategoryColor(category.slug);
  const borderHover = colors.borderHover;
  const shadowHover = colors.shadow;
  const badgeColor = colors.badge;
  const pillHover = colors.pillHover;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={categoryName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm card-elevated
        transition-all duration-300
        hover:-translate-y-1.5 hover:shadow-xl ${shadowHover} ${borderHover}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none
        overflow-hidden
      `}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-emerald-500/3 via-transparent to-transparent" />

      {/* Category icon + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <DynamicIcon name={category.icon} className="size-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-card-foreground leading-snug">
            {categoryName}
          </h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-0.5 ${badgeColor}`}>
            {toolCountLabel}
          </span>
        </div>
      </div>

      {/* Example tools with category-specific hover */}
      {examples.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {examples.map((name) => (
            <span
              key={name}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] bg-muted/70 text-muted-foreground transition-colors duration-200 ${pillHover}`}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Arrow indicator */}
      <div className="absolute bottom-4 end-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
        <ChevronRight className="size-4 text-emerald-500 rtl:rotate-180" />
      </div>
    </div>
  );
}
