'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localize, getCategoryName, type ToolDescriptor } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { PrivacyBadge } from '@/components/PrivacyBadge';

interface SearchDropdownProps {
  results: ToolDescriptor[];
  query: string;
  isOpen: boolean;
  onClose: () => void;
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
}

/**
 * Positioned dropdown below search input showing matching tools.
 * Supports keyboard navigation (Enter to select, Escape to close),
 * click outside to close, and scroll for long result lists.
 */
export function SearchDropdown({
  results,
  isOpen,
  onClose,
  selectedIndex,
  onSelectIndex,
}: SearchDropdownProps) {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Keyboard handling for the dropdown items
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const tool = results[selectedIndex];
        if (tool) {
          onSelectIndex(selectedIndex);
          navigateToTool(tool.id);
          onClose();
        }
      }
    },
    [onClose, results, selectedIndex, onSelectIndex, navigateToTool]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || results.length === 0) return;
    const el = dropdownRef.current?.querySelector(`[data-search-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen, results.length]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="listbox"
      aria-label={t('search.placeholder')}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`
        absolute start-0 end-0 top-full z-50 mt-1 overflow-hidden rounded-lg border
        border-border bg-popover shadow-lg
        animate-in fade-in-0 zoom-in-95 slide-in-from-top-2
        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
      `}
    >
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <DynamicIcon name="Search" className="size-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">{t('search.noResults')}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{t('search.searchBy')}</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto overscroll-contain scrollbar-thin">
          {results.map((tool, index) => {
            const isSelected = index === selectedIndex;
            const toolName = localize(tool.name, locale);
            const categoryName = getCategoryName(tool.category, locale);

            return (
              <div
                key={tool.id}
                role="option"
                aria-selected={isSelected}
                data-search-index={index}
                onClick={() => {
                  onSelectIndex(index);
                  navigateToTool(tool.id);
                  onClose();
                }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-popover-foreground'
                  }
                `}
              >
                {/* Tool icon */}
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <DynamicIcon name={tool.icon} className="size-4 text-muted-foreground" />
                </div>

                {/* Tool name + category badge */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{toolName}</p>
                  <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-muted/80 text-muted-foreground mt-0.5">
                    {categoryName}
                  </span>
                </div>

                {/* Privacy badge */}
                <PrivacyBadge level={tool.privacy} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
