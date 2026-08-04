'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Database, ExternalLink, FileLock2, ShieldAlert, ShieldCheck, WifiOff } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { Offline, Privacy, Retention } from '@/lib/tool-schema';
import { localize, type ToolDescriptor } from '@/lib/tool-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type DisclosureKey = string;

const PRIVACY_DETAILS: Record<Privacy, { icon: typeof ShieldCheck; key: DisclosureKey }> = {
  local: { icon: ShieldCheck, key: 'tool.disclosurePrivacyLocal' },
  'file-only': { icon: FileLock2, key: 'tool.disclosurePrivacyFileOnly' },
  storage: { icon: Database, key: 'tool.disclosurePrivacyStorage' },
  api: { icon: ShieldAlert, key: 'tool.disclosurePrivacyApi' },
};

const OFFLINE_DETAILS: Record<Offline, DisclosureKey> = {
  full: 'tool.disclosureOfflineFull',
  partial: 'tool.disclosureOfflinePartial',
  unavailable: 'tool.disclosureOfflineUnavailable',
};

const RETENTION_DETAILS: Record<Retention, DisclosureKey> = {
  none: 'tool.disclosureRetentionNone',
  session: 'tool.disclosureRetentionSession',
  'browser-storage': 'tool.disclosureRetentionBrowserStorage',
  external: 'tool.disclosureRetentionExternal',
};

interface PrivacyDisclosureProps {
  tool: ToolDescriptor;
  onContinue: () => void;
  onCancel: () => void;
}

/**
 * QS-SPEC-001 T012: gate tool component mounting behind a bilingual privacy
 * and offline disclosure. The API path additionally requires a local-only
 * checkbox interaction before the caller may mount the tool component.
 */
export function PrivacyDisclosure({ tool, onContinue, onCancel }: PrivacyDisclosureProps) {
  const { t, locale } = useI18n();
  const [consentChecked, setConsentChecked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const consentId = useId();
  const isRtl = locale === 'ar';
  const requiresConsent = tool.privacy === 'api';
  const privacyDetail = PRIVACY_DETAILS[tool.privacy];
  const PrivacyIcon = privacyDetail.icon;
  const toolName = localize(tool.name, locale);

  useEffect(() => {
    // Move focus to the disclosure heading so assistive technology announces
    // the gate when SPA navigation opens a new tool.
    headingRef.current?.focus();
  }, [tool.id]);

  return (
    <Card
      data-testid="tool-use-disclosure"
      role="region"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/70 dark:bg-emerald-950/20"
    >
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2
              ref={headingRef}
              id={titleId}
              tabIndex={-1}
              className="text-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t('tool.disclosureTitle')}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t('tool.disclosureIntro', { tool: toolName })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2" data-testid="tool-disclosure-details">
          <div className="rounded-lg border border-border/70 bg-background/70 p-3">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <PrivacyIcon className="size-4" aria-hidden="true" />
              {t('tool.disclosurePrivacyLabel')}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              {t(privacyDetail.key)}
            </dd>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/70 p-3">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <WifiOff className="size-4" aria-hidden="true" />
              {t('tool.disclosureOfflineLabel')}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              {t(OFFLINE_DETAILS[tool.offline])}
            </dd>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/70 p-3 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Database className="size-4" aria-hidden="true" />
              {t('tool.disclosureRetentionLabel')}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              {t(RETENTION_DETAILS[tool.retention])}
            </dd>
          </div>
        </dl>

        {requiresConsent && tool.evidence.networkEgress !== 'none' && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-200">
            <ExternalLink className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="font-semibold">{t('tool.disclosureDestinationLabel')}: </span>
              <span className="break-all">{tool.evidence.networkEgress.endpoint}</span>
              <span className="mt-1 block text-xs">
                <span className="font-semibold">{t('tool.disclosureDataLabel')}: </span>
                {tool.evidence.networkEgress.data}
              </span>
              <span className="mt-1 block text-xs">
                <span className="font-semibold">{t('tool.disclosurePurposeLabel')}: </span>
                {tool.evidence.networkEgress.purpose}
              </span>
            </span>
          </p>
        )}

        {requiresConsent && (
          <div className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 dark:border-amber-800/70 dark:bg-amber-950/20">
            <label htmlFor={consentId} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
              <input
                id={consentId}
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
                aria-describedby={`${descriptionId} ${consentId}-help`}
                className="mt-1 size-4 shrink-0 accent-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <span>{t('tool.disclosureConsentLabel')}</span>
            </label>
            <p id={`${consentId}-help`} className="ms-7 text-xs leading-relaxed text-muted-foreground">
              {t('tool.disclosureConsentHelp')}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('tool.disclosureNotNow')}
        </Button>
        <Button
          type="button"
          data-testid="tool-disclosure-continue"
          disabled={requiresConsent && !consentChecked}
          onClick={onContinue}
        >
          {requiresConsent ? t('tool.disclosureConsentAndContinue') : t('tool.disclosureContinue')}
        </Button>
      </CardFooter>
    </Card>
  );
}
