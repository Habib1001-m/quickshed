'use client';

import { useState, useEffect, useCallback } from 'react';
import { Paintbrush, Check, RotateCcw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  ACCENT_COLORS,
  applyAccentColor,
  resetAccentColor,
  getSavedAccentColor,
} from '@/lib/accent-colors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ThemeCustomizer() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (typeof window === 'undefined') return 'emerald';
    return getSavedAccentColor() ?? 'emerald';
  });

  const isRTL = locale === 'ar';

  // Listen for custom event to open
  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener('quickshed-theme-customizer', handleOpen);
    return () => window.removeEventListener('quickshed-theme-customizer', handleOpen);
  }, []);

  const handleColorSelect = useCallback((colorId: string) => {
    setSelectedColor(colorId);
    applyAccentColor(colorId);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedColor('emerald');
    resetAccentColor();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="glass-card border-border/50 sm:max-w-lg"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Paintbrush className="size-5 text-[var(--accent-custom,var(--ring))]" />
            {t('common.themeCustomizer')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRTL
              ? 'اختر لون التمييز المفضل لديك لتخصيص مظهر التطبيق'
              : 'Choose your preferred accent color to personalize the app appearance'}
          </DialogDescription>
        </DialogHeader>

        {/* Accent Color Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-custom,var(--ring))]">
            {t('common.accentColor')}
          </h3>

          <div className="grid grid-cols-4 gap-4">
            {ACCENT_COLORS.map((color) => {
              const isSelected = selectedColor === color.id;
              const colorName = isRTL ? color.name.ar : color.name.en;

              return (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-custom,var(--ring))] ${
                    isSelected ? 'bg-muted/50' : ''
                  }`}
                  aria-label={colorName}
                  aria-pressed={isSelected}
                >
                  <div className="relative">
                    <div
                      className={`size-12 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: isSelected
                          ? `0 0 12px ${color.hex}40`
                          : undefined,
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="size-5 text-white drop-shadow-sm" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-foreground/80 text-center leading-tight">
                    {colorName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview Area */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-custom,var(--ring))]">
              {t('common.preview')}
            </h3>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Preview Button */}
                <Button
                  size="sm"
                  className="text-white border-0 shadow-sm"
                  style={{
                    backgroundColor: ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981',
                  }}
                >
                  {isRTL ? 'زر العينة' : 'Sample Button'}
                </Button>

                {/* Preview Badge */}
                <Badge
                  className="text-white border-0"
                  style={{
                    backgroundColor: ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981',
                  }}
                >
                  {isRTL ? 'شارة' : 'Badge'}
                </Badge>

                {/* Preview outline badge */}
                <Badge
                  variant="outline"
                  style={{
                    borderColor: ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981',
                    color: ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981',
                  }}
                >
                  {isRTL ? 'مخطط' : 'Outline'}
                </Badge>
              </div>

              {/* Preview Card */}
              <div
                className="rounded-lg border p-3 transition-colors"
                style={{
                  borderColor: `${ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981'}30`,
                  background: `${ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981'}08`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: ACCENT_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#10B981',
                    }}
                  />
                  <span className="text-sm font-medium text-foreground/80">
                    {isRTL ? 'بطاقة معاينة مع لون التمييز' : 'Preview card with accent color'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground micro-bounce"
              onClick={handleReset}
              disabled={selectedColor === 'emerald'}
            >
              <RotateCcw className="size-3.5" />
              {t('common.resetToDefault')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
