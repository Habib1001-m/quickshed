/**
 * QS-SPEC-001 — Tool Quality & Privacy Contract (T004)
 *
 * Single source of truth for the QuickShed tool metadata contract.
 * The TypeScript {@link Tool} type is derived from {@link ToolSchema} via
 * `z.infer`, so the JSON shape (content/tools/*.json, content/tools-index.json)
 * and the TypeScript `ToolDescriptor` cannot silently drift.
 *
 * Enumerations and the privacy/retention matrix mirror spec.md verbatim.
 * The schema is reusable by the later static validation guard (T008); no new
 * runtime dependency is introduced (zod is already a project dependency).
 */
import { z } from 'zod';

// ─── Closed enumerations (spec.md "Terminology and Contract") ─────────

export const PRIVACY_VALUES = ['local', 'file-only', 'storage', 'api'] as const;
export const OFFLINE_VALUES = ['full', 'partial', 'unavailable'] as const;
export const RETENTION_VALUES = ['none', 'session', 'browser-storage', 'external'] as const;
export const RISK_VALUES = ['low', 'medium', 'high'] as const;

export const PrivacySchema = z.enum(PRIVACY_VALUES);
export const OfflineSchema = z.enum(OFFLINE_VALUES);
export const RetentionSchema = z.enum(RETENTION_VALUES);
export const RiskSchema = z.enum(RISK_VALUES);

export type Privacy = z.infer<typeof PrivacySchema>;
export type Offline = z.infer<typeof OfflineSchema>;
export type Retention = z.infer<typeof RetentionSchema>;
export type Risk = z.infer<typeof RiskSchema>;

// ─── Bilingual + identity primitives ─────────────────────────────────

export const LocalizedStringSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

/**
 * Deep-link route convention. The literal token `[locale]` resolves to BOTH
 * supported locales: `/en/tools/<slug>` and `/ar/tools/<slug>`. Every tool
 * route is statically generated for both locales (see
 * src/app/[locale]/tools/[slug]/page.tsx generateStaticParams).
 */
export const TOOL_ROUTE_PATTERN = /^\/\[locale\]\/tools\/[a-z0-9-]+$/;
export const RouteSchema = z
  .string()
  .min(1)
  .regex(TOOL_ROUTE_PATTERN, "route must be '/[locale]/tools/<slug>'");

// ─── Data-flow evidence (spec.md "Data-Flow Evidence") ───────────────

export const NetworkEgressSchema = z.union([
  z.literal('none'),
  z.object({
    endpoint: z.string().url(),
    data: z.string().trim().min(1),
    purpose: z.string().trim().min(1),
  }),
]);

export const DataFlowEvidenceSchema = z.object({
  inspectedCodePaths: z.array(z.string().min(1)).min(1),
  networkEgress: NetworkEgressSchema,
  networkEgressBasis: z.string().min(1).optional(),
  storagePersistenceTargets: z.string().min(1),
  consentGateReference: z.string().trim().min(1),
  auditBasis: z.string().min(1),
  sourceRevision: z.string().min(1),
});

// ─── Full tool contract ──────────────────────────────────────────────

export const ToolSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: LocalizedStringSchema,
    description: LocalizedStringSchema,
    category: z.string().min(1),
    icon: z.string().min(1),
    component: z.string().min(1),
    route: RouteSchema,
    privacy: PrivacySchema,
    offline: OfflineSchema,
    retention: RetentionSchema,
    riskLevel: RiskSchema,
    /**
     * Existing bilingual keyword representation: a flat array mixing English
     * and Arabic terms (e.g. ["pdf", "merge", "دمج"]). Kept as-is for the
     * least churn; both locales are represented in every tool's array.
     */
    keywords: z
      .array(z.string().trim().min(1))
      .refine(
        (arr) =>
          arr.some((t) => /[A-Za-z]/.test(t)) &&
          arr.some((t) => /[\u0600-\u06FF]/.test(t)),
        'keywords must include at least one Latin-script term and one Arabic-script term',
      ),
    inputs: z.array(z.string().min(1)).min(1),
    outputs: z.array(z.string().min(1)).min(1),
    evidence: DataFlowEvidenceSchema,
    createdAt: z.string().min(1).optional(),
    updatedAt: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    const { privacy, retention, evidence } = val;

    // Privacy/retention consistency matrix (spec.md "Privacy/Retention Consistency").
    const matrixOk =
      (privacy === 'storage' && retention === 'browser-storage') ||
      ((privacy === 'local' || privacy === 'file-only') &&
        (retention === 'none' || retention === 'session')) ||
      (privacy === 'api' &&
        (retention === 'none' ||
          retention === 'session' ||
          retention === 'browser-storage' ||
          retention === 'external'));
    if (!matrixOk) {
      ctx.addIssue({
        code: 'custom',
        message: `invalid privacy/retention combination: ${privacy}/${retention}`,
        path: ['retention'],
      });
    }

    // non-api tools must have no network egress; api tools must not be 'none'.
    if (privacy === 'api') {
      if (evidence.networkEgress === 'none') {
        ctx.addIssue({
          code: 'custom',
          message: 'privacy api must not have networkEgress "none"',
          path: ['evidence', 'networkEgress'],
        });
      }
    } else if (evidence.networkEgress !== 'none') {
      ctx.addIssue({
        code: 'custom',
        message: `privacy ${privacy} requires networkEgress "none"`,
        path: ['evidence', 'networkEgress'],
      });
    }

    // api / external retention requires a real (non not-applicable) consent gate.
    const needsConsent = privacy === 'api' || retention === 'external';
    if (needsConsent && /^(none|not-applicable)$/i.test(evidence.consentGateReference)) {
      ctx.addIssue({
        code: 'custom',
        message: 'privacy api / retention external requires a consent-gate reference',
        path: ['evidence', 'consentGateReference'],
      });
    }
  });

export type Tool = z.infer<typeof ToolSchema>;
export type DataFlowEvidence = z.infer<typeof DataFlowEvidenceSchema>;
