'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getAllTools, getToolById, getToolsByCategory,
  localize, getCategoryName,
} from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from '@/lib/category-config';

interface Recommendation {
  tool: NonNullable<ReturnType<typeof getToolById>>;
  reason: string;
  reasonAr: string;
  type: 'similar' | 'trending' | 'discovery';
}

/**
 * Smart Recommendations component that suggests tools based on:
 * 1. Tools from categories the user frequently uses
 * 2. Tools they haven't tried yet (discovery)
 * 3. Popular/trending tools in the toolbox
 */
export function SmartRecommendations() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const recentTools = useAppStore((s) => s.recentTools);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);
  const favorites = useAppStore((s) => s.favorites);
  const isRtl = locale === 'ar';

  // Generate recommendations based on usage patterns
  const recommendations = useMemo(() => {
    const allTools = getAllTools();
    const recs: Recommendation[] = [];
    const usedToolIds = new Set([
      ...recentTools,
      ...Object.keys(toolUsageCount),
      ...favorites,
    ]);

    // Find most-used category
    const categoryUsage: Record<string, number> = {};
    for (const [toolId, count] of Object.entries(toolUsageCount)) {
      const tool = getToolById(toolId);
      if (tool) {
        categoryUsage[tool.category] = (categoryUsage[tool.category] || 0) + count;
      }
    }

    // Also count categories from recent tools
    for (const toolId of recentTools) {
      const tool = getToolById(toolId);
      if (tool) {
        categoryUsage[tool.category] = (categoryUsage[tool.category] || 0) + 1;
      }
    }

    // Sort categories by usage
    const topCategories = Object.entries(categoryUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    // 1. "Based on your usage" - Tools from top categories that user hasn't tried
    if (topCategories.length > 0) {
      for (const catSlug of topCategories) {
        const catTools = getToolsByCategory(catSlug);
        const unused = catTools.filter((t) => !usedToolIds.has(t.id));
        // Pick up to 2 unused tools from top categories
        for (const tool of unused.slice(0, 2)) {
          recs.push({
            tool,
            reason: `Because you use ${getCategoryName(catSlug, 'en')} tools`,
            reasonAr: `لأنك تستخدم أدوات ${getCategoryName(catSlug, 'ar')}`,
            type: 'similar',
          });
        }
      }
    }

    // 2. "Discover" - Tools from categories the user has never used
    const usedCategories = new Set(topCategories);
    const unusedCategories = allTools
      .map((t) => t.category)
      .filter((cat, i, arr) => !usedCategories.has(cat) && arr.indexOf(cat) === i);

    if (unusedCategories.length > 0) {
      // Pick popular tools from unused categories
      for (const catSlug of unusedCategories.slice(0, 2)) {
        const catTools = getToolsByCategory(catSlug);
        // Pick the first tool from each unused category
        if (catTools.length > 0) {
          const tool = catTools[0];
          recs.push({
            tool,
            reason: `Try something new: ${getCategoryName(catSlug, 'en')}`,
            reasonAr: `جرب شيئاً جديداً: ${getCategoryName(catSlug, 'ar')}`,
            type: 'discovery',
          });
        }
      }
    }

    // 3. "Trending" - Most-used tools overall (mock: based on current session)
    if (Object.keys(toolUsageCount).length > 0) {
      const topUsed = Object.entries(toolUsageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => getToolById(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

      for (const tool of topUsed) {
        if (tool && !recs.find((r) => r.tool.id === tool.id)) {
          recs.push({
            tool,
            reason: 'Most used by you',
            reasonAr: 'الأكثر استخداماً لك',
            type: 'trending',
          });
        }
      }
    }

    // If we have very few recommendations, add some popular default tools
    if (recs.length < 3) {
      const defaultTools = ['password-generator', 'json-formatter', 'color-converter', 'qr-code-generator', 'bmi-calculator'];
      for (const id of defaultTools) {
        if (recs.length >= 5) break;
        const tool = getToolById(id);
        if (tool && !recs.find((r) => r.tool.id === tool.id)) {
          recs.push({
            tool,
            reason: 'Popular tool',
            reasonAr: 'أداة شائعة',
            type: 'trending',
          });
        }
      }
    }

    // Deduplicate and limit to 6
    const seen = new Set<string>();
    return recs.filter((r) => {
      const id = r.tool.id;
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 6);
  }, [recentTools, toolUsageCount, favorites]);

  // Don't show if no recommendations
  if (recommendations.length === 0) return null;

  const typeIcons = {
    similar: TrendingUp,
    trending: Star,
    discovery: Sparkles,
  };

  const typeColors = {
    similar: 'text-violet-500',
    trending: 'text-amber-500',
    discovery: 'text-emerald-500',
  };

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="size-4.5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {locale === 'ar' ? 'أدوات موصى بها' : 'Recommended For You'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'اقتراحات مخصصة بناءً على استخدامك' : 'Personalized suggestions based on your usage'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => {
            const TypeIcon = typeIcons[rec.type];
            const typeColor = typeColors[rec.type];
            const colorClass = getCategoryColor(rec.tool.category).icon;
            const toolName = localize(rec.tool.name, locale);

            return (
              <motion.div
                key={rec.tool.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group relative flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer overflow-hidden"
                onClick={() => navigateToTool(rec.tool.id)}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none group-hover:from-emerald-500/[0.05] transition-all duration-300" />

                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClass} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <DynamicIcon name={rec.tool.icon} className="size-5" />
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {toolName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TypeIcon className={`size-3 ${typeColor}`} />
                    <span className="text-xs text-muted-foreground truncate">
                      {locale === 'ar' ? rec.reasonAr : rec.reason}
                    </span>
                  </div>
                </div>

                <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-emerald-500 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 rtl:rotate-180 mt-1" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
