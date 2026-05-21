'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompareArrows, X, Plus, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getToolsByCategory,
  getToolById,
  getCategoryName,
  localize,
  type ToolDescriptor,
} from '@/lib/tool-utils';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getCategoryColor } from '@/lib/category-config';

interface ToolCompareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolCompare({ open, onOpenChange }: ToolCompareProps) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';
  const compareToolIds = useAppStore((s) => s.compareToolIds);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const removeFromCompare = useAppStore((s) => s.removeFromCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);

  const [selectCategory, setSelectCategory] = useState<string | null>(null);

  // Determine the common category of already-selected tools
  const selectedTools = useMemo(() => {
    return compareToolIds
      .map((id) => getToolById(id))
      .filter(Boolean) as ToolDescriptor[];
  }, [compareToolIds]);

  // Lock to the category of the first selected tool
  const lockedCategory = useMemo(() => {
    if (selectedTools.length === 0) return null;
    return selectedTools[0].category;
  }, [selectedTools]);

  // Get tools from the same category for selection
  const availableTools = useMemo(() => {
    const category = lockedCategory || selectCategory;
    if (!category) return [];
    return getToolsByCategory(category).filter(
      (tool) => !compareToolIds.includes(tool.id)
    );
  }, [lockedCategory, selectCategory, compareToolIds]);

  const handleAddTool = useCallback(
    (toolId: string) => {
      addToCompare(toolId);
    },
    [addToCompare]
  );

  const handleRemoveTool = useCallback(
    (toolId: string) => {
      removeFromCompare(toolId);
    },
    [removeFromCompare]
  );

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        clearCompare();
        setSelectCategory(null);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, clearCompare]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto glass-strong"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="size-5 text-emerald-500" />
            {t('common.compareTools')}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'حدد أدوات من نفس التصنيف للمقارنة جنباً إلى جنب (حتى 3)'
              : 'Select tools from the same category to compare side by side (up to 3)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tool selection area */}
          {selectedTools.length < 3 && (
            <div className="space-y-3">
              {/* Category selector if no tools selected yet */}
              {selectedTools.length === 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('common.compareCategory')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['calculators', 'time-tools', 'text-tools', 'converters', 'student-tools', 'pdf-tools', 'utility-tools', 'seo-tools', 'developer-tools', 'image-tools', 'security-tools'].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectCategory(cat === selectCategory ? null : cat)}
                          className={`
                            rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                            ${selectCategory === cat
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }
                          `}
                        >
                          {getCategoryName(cat, locale)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Available tools from same category */}
              {(lockedCategory || selectCategory) && availableTools.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('common.addToolToCompare')}:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                    {availableTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleAddTool(tool.id)}
                        className="flex items-center gap-2 rounded-lg border border-border/50 p-2 text-sm
                          hover:bg-emerald-50 hover:border-emerald-500/30 dark:hover:bg-emerald-950/20
                          transition-colors text-start"
                      >
                        <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${getCategoryColor(tool.category).icon}`}>
                          <DynamicIcon name={tool.icon} className="size-3.5" />
                        </div>
                        <span className="truncate text-foreground">{localize(tool.name, locale)}</span>
                        <Plus className="size-3.5 text-emerald-500 shrink-0 ms-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comparison table */}
          {selectedTools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-start p-3 text-sm font-medium text-muted-foreground border-b w-28" />
                    {selectedTools.map((tool) => (
                      <th key={tool.id} className="p-3 border-b min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${getCategoryColor(tool.category).icon}`}>
                            <DynamicIcon name={tool.icon} className="size-4" />
                          </div>
                          <span className="font-semibold text-foreground text-sm truncate">
                            {localize(tool.name, locale)}
                          </span>
                          <button
                            onClick={() => handleRemoveTool(tool.id)}
                            className="size-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground border-b">
                      {t('common.compareCategory')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3 border-b">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(tool.category, locale)}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  {/* Privacy row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground border-b">
                      {t('common.comparePrivacy')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3 border-b">
                        <PrivacyBadge level={tool.privacy} />
                      </td>
                    ))}
                  </tr>
                  {/* Description row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-muted-foreground">
                      {t('common.compareDescription')}
                    </td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-3">
                        <p className="text-sm text-foreground leading-relaxed">
                          {localize(tool.description, locale)}
                        </p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompareArrows className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm">{t('common.noToolsToCompare')}</p>
            </div>
          )}

          {/* Selected count indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {locale === 'ar'
                ? `${selectedTools.length} من 3 أدوات محددة`
                : `${selectedTools.length} of 3 tools selected`}
            </p>
            {selectedTools.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompare}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t('common.removeFromCompare')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
