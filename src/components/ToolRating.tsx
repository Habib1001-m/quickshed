'use client';

import { useId, useState } from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { saveRating, getRating, removeRating } from '@/lib/tool-ratings';

interface ToolRatingProps {
  toolId: string;
}

function loadRating(toolId: string) {
  if (typeof window === 'undefined') return 0;
  return getRating(toolId);
}

export function ToolRating({ toolId }: ToolRatingProps) {
  const { t, locale } = useI18n();
  const ratingInstructionsId = useId();
  const [previousToolId, setPreviousToolId] = useState(toolId);
  const [userRating, setUserRating] = useState(() => loadRating(toolId));
  const [hoverRating, setHoverRating] = useState(0);

  if (toolId !== previousToolId) {
    setPreviousToolId(toolId);
    setUserRating(loadRating(toolId));
    setHoverRating(0);
  }

  const handleRate = (rating: number) => {
    setHoverRating(0);

    if (userRating === rating) {
      removeRating(toolId);
      setUserRating(0);
      return;
    }

    saveRating(toolId, rating);
    setUserRating(rating);
  };

  const displayRating = hoverRating || userRating;

  return (
    <div
      role="group"
      aria-label={t('common.ratingOnThisDevice')}
      aria-describedby={ratingInstructionsId}
      className="flex items-center gap-3"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className="text-xs text-muted-foreground">
        {t('common.ratingOnThisDevice')}:
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            aria-label={t('common.rateStar', { star })}
            aria-pressed={userRating === star}
          >
            <Star
              aria-hidden="true"
              className={`size-5 transition-colors duration-150 ${
                star <= displayRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30 hover:text-amber-400/50'
              }`}
            />
          </button>
        ))}
      </div>
      {userRating > 0 && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {userRating}/5
        </span>
      )}
      <span id={ratingInstructionsId} className="sr-only">
        {t('common.ratingInstructions')}
      </span>
    </div>
  );
}
