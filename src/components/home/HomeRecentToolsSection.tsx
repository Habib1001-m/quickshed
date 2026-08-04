'use client';

import { useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, localize, type ToolDescriptor } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from '@/lib/category-config';

export function HomeRecentToolsSection() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const recentTools = useAppStore((s) => s.recentTools);
  const clearRecentTools = useAppStore((s) => s.clearRecentTools);

  const recentToolDescriptors = useMemo(() => {
    return recentTools
      .map((id) => getToolById(id))
      .filter((tool): tool is ToolDescriptor => tool !== undefined);
  }, [recentTools]);

  if (recentToolDescriptors.length === 0) return null;

  return (
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
  );
}
