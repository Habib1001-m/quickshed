'use client';

import { Shield, ShieldAlert, FileLock2, Database, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Privacy } from '@/lib/tool-schema';

interface PrivacyBadgeProps {
  /** Shared QS-SPEC-001 Privacy union: 'local' | 'file-only' | 'storage' | 'api'. */
  level: Privacy;
  className?: string;
}

type Variant = {
  labelKey: string;
  tooltipKey: string;
  Icon: LucideIcon;
  /** Same compact-pill palette shape across all levels; hue is the only switch. */
  classes: string;
};

const VARIANTS: Record<Privacy, Variant> = {
  // Emerald — data never leaves the device.
  local: {
    labelKey: 'tool.privacyLocalShort',
    tooltipKey: 'tool.privacyLocal',
    Icon: Shield,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  // Sky — processed in-browser, scoped to the file you load. Distinct from API.
  'file-only': {
    labelKey: 'tool.privacyFileOnlyShort',
    tooltipKey: 'tool.privacyFileOnly',
    Icon: FileLock2,
    classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  // Violet — persisted to browser storage, still on-device. Distinct from API.
  storage: {
    labelKey: 'tool.privacyStorageShort',
    tooltipKey: 'tool.privacyStorage',
    Icon: Database,
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  // Amber — uses an external service.
  api: {
    labelKey: 'tool.privacyApiShort',
    tooltipKey: 'tool.privacyApi',
    Icon: ShieldAlert,
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

/**
 * Small pill/badge showing the privacy level of a tool. Each Privacy value
 * (`local`, `file-only`, `storage`, `api`) gets its own accurate label,
 * tooltip, icon, and color; `file-only` / `storage` never fall through to API.
 * Tooltip structure and compact visual language are unchanged.
 */
export function PrivacyBadge({ level, className = '' }: PrivacyBadgeProps) {
  const { t } = useI18n();
  const { labelKey, tooltipKey, Icon, classes } = VARIANTS[level];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium
            leading-none whitespace-nowrap select-none
            ${classes}
            ${className}
          `}
        >
          <Icon className="size-3 shrink-0" />
          <span>{t(labelKey)}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4}>
        <p>{t(tooltipKey)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
