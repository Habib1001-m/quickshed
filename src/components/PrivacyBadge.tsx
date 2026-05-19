'use client';

import { Shield, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  level: 'local' | 'api';
  className?: string;
}

/**
 * Small pill/badge showing the privacy level of a tool.
 * - `local`: Green background with shield icon — data stays on device
 * - `api`: Amber/orange background with warning icon — uses external service
 * Includes a tooltip with the full privacy message on hover.
 */
export function PrivacyBadge({ level, className = '' }: PrivacyBadgeProps) {
  const { t } = useI18n();

  const isLocal = level === 'local';

  const label = isLocal ? t('tool.privacyLocalShort') : t('tool.privacyApiShort');
  const tooltipText = isLocal ? t('tool.privacyLocal') : t('tool.privacyApi');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium
            leading-none whitespace-nowrap select-none
            ${isLocal
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }
            ${className}
          `}
        >
          {isLocal ? (
            <Shield className="size-3 shrink-0" />
          ) : (
            <ShieldAlert className="size-3 shrink-0" />
          )}
          <span>{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4}>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
