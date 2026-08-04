'use client';

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { ArrowRight, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getAllTools, getCategories, getCategoryName, localize } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Input } from '@/components/ui/input';
import { fadeUp, STATS_CONFIG, stagger } from './home-config';

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
      { threshold: 0.5 },
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

export function HomeHeroSection() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const categories = useMemo(() => getCategories(), []);
  const allTools = useMemo(() => getAllTools(), []);

  const stats = useMemo(() => {
    return STATS_CONFIG.map((stat) => ({
      ...stat,
      value: stat.type === 'tools' ? allTools.length : stat.type === 'categories' ? categories.length : 100,
    }));
  }, [allTools, categories]);

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
    [allTools],
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
        setHeroResults(results.map((result) => result.item));
        setHeroSearchOpen(true);
      }, 150);
    },
    [fuse],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        heroDropdownRef.current &&
        !heroDropdownRef.current.contains(event.target as Node) &&
        heroInputRef.current &&
        !heroInputRef.current.contains(event.target as Node)
      ) {
        setHeroSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const openToolFromSearch = (toolId: string) => {
    navigateToTool(toolId);
    setHeroQuery('');
    setHeroResults([]);
    setHeroSearchOpen(false);
  };

  return (
    <section className="relative overflow-hidden mesh-gradient" data-onboarding="welcome">
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] blur-3xl pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] start-[8%] w-16 h-16 rounded-2xl bg-emerald-500/4 dark:bg-emerald-400/3 animate-float-slow" />
        <div className="absolute top-[25%] end-[12%] w-12 h-12 rounded-full bg-sky-500/4 dark:bg-sky-400/3 animate-float-reverse" />
        <div className="absolute top-[60%] start-[5%] w-10 h-10 rounded-lg bg-violet-500/4 dark:bg-violet-400/3 animate-float" />
        <div className="absolute top-[70%] end-[8%] w-20 h-20 rounded-3xl bg-emerald-500/3 dark:bg-emerald-400/2 animate-spin-slow" />
        <div className="absolute top-[40%] end-[30%] w-8 h-8 rounded-full bg-orange-500/4 dark:bg-orange-400/3 animate-float-slow" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="hero-badge-float">
            <span className="floating-label text-sm font-bold shadow-lg shadow-emerald-500/15 dark:shadow-emerald-500/25 px-4 py-1.5 gap-2">
              <span className="size-3 rounded-full bg-emerald-500 animate-pulse-ring" />
              <AnimatedCounter value={allTools.length} suffix="+ " />
              {t('home.statsTools', { count: '' }).replace(/\d+\+?\s*/, '')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl hero-title-shimmer"
          >
            {t('home.heroTitle')}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 text-lg md:text-xl text-foreground max-w-2xl leading-relaxed"
          >
            {t('home.heroSubtitle')}
          </motion.p>

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
              aria-label={t('home.heroSearchPlaceholder')}
              value={heroQuery}
              onChange={(event) => handleHeroSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && heroResults.length > 0) {
                  openToolFromSearch(heroResults[0].id);
                }
              }}
              onFocus={() => {
                setHeroFocused(true);
                if (heroResults.length > 0) setHeroSearchOpen(true);
              }}
              onBlur={() => setHeroFocused(false)}
              className="ps-14 pe-20 h-16 text-base rounded-2xl hero-search-input search-border-animate placeholder:text-foreground/40 dark:placeholder:text-foreground/50"
            />
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

            {heroSearchOpen && heroResults.length > 0 && (
              <div
                ref={heroDropdownRef}
                className="absolute top-full mt-2 inset-x-0 glass-strong rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="max-h-72 overflow-y-auto">
                  {heroResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => openToolFromSearch(tool.id)}
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

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-5"
          >
            {stats.map((stat, index) => (
              <div key={stat.key} className="stat-card flex flex-col items-center gap-2 rounded-2xl px-6 py-5 min-w-[120px]">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                  <stat.icon className="size-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="hero-stat-number stat-number-pulse">
                  <AnimatedCounter value={stat.value} suffix={index >= 2 ? '%' : '+'} />
                </span>
                <span className="hero-stat-label">{t(stat.key)}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
