'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { saveRating, getRating, getRatingCount } from '@/lib/tool-ratings';

interface ToolRatingProps {
  toolId: string;
}

function loadInitialData(toolId: string) {
  if (typeof window === 'undefined') return { rating: 0, count: 0 };
  return {
    rating: getRating(toolId),
    count: getRatingCount(toolId),
  };
}

export function ToolRating({ toolId }: ToolRatingProps) {
  const { t, locale } = useI18n();
  const [initialData] = useState(() => loadInitialData(toolId));
  const [userRating, setUserRating] = useState(initialData.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(initialData.count);

  const handleRate = (rating: number) => {
    const newRating = userRating === rating ? 0 : rating;
    setUserRating(newRating);
    saveRating(toolId, newRating);
    setRatingCount(getRatingCount(toolId));
  };

  const displayRating = hoverRating || userRating;

  return (
    <div className="flex items-center gap-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span className="text-xs text-muted-foreground">
        {t('common.rateTool')}:
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            aria-label={`${star} ${locale === 'ar' ? 'نجوم' : 'stars'}`}
          >
            <Star
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
        <span className="text-xs text-muted-foreground">
          {userRating}/5
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        ({ratingCount} {locale === 'ar' ? 'تقييم' : 'rating'}{ratingCount !== 1 ? (locale === 'ar' ? '' : 's') : ''})
      </span>
    </div>
  );
}
