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
import { TOOL_CATEGORY_SLUGS } from './tool-taxonomy';

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

const NonBlankStringSchema = z.string().trim().min(1);
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LocalizedStringSchema = z
  .object({
    en: NonBlankStringSchema,
    ar: NonBlankStringSchema,
  })
  .strict();

/**
 * Deep-link route convention. The literal token `[locale]` resolves to BOTH
 * supported locales: `/en/tools/<slug>` and `/ar/tools/<slug>`. Every tool
 * route is statically generated for both locales (see
 * src/app/[locale]/tools/[slug]/page.tsx generateStaticParams).
 */
export const TOOL_ROUTE_PATTERN = /^\/\[locale\]\/tools\/[a-z0-9-]+$/;
export const RouteSchema = z
  .string()
  .trim()
  .min(1)
  .regex(TOOL_ROUTE_PATTERN, "route must be '/[locale]/tools/<slug>'");

// ─── Data-flow evidence (spec.md "Data-Flow Evidence") ───────────────

export const NetworkEgressSchema = z.union([
  z.literal('none'),
  z
    .object({
      endpoint: z.string().trim().url(),
      data: NonBlankStringSchema,
      purpose: NonBlankStringSchema,
    })
    .strict(),
]);

export const DataFlowEvidenceSchema = z
  .object({
    inspectedCodePaths: z.array(NonBlankStringSchema).min(1),
    networkEgress: NetworkEgressSchema,
    networkEgressBasis: NonBlankStringSchema.optional(),
    storagePersistenceTargets: NonBlankStringSchema,
    consentGateReference: NonBlankStringSchema,
    auditBasis: NonBlankStringSchema,
    sourceRevision: NonBlankStringSchema,
  })
  .strict();

// ─── Full tool contract ──────────────────────────────────────────────

export const ToolSchema = z
  .object({
    id: z.string().trim().min(1).regex(KEBAB_CASE_PATTERN, 'id must use kebab-case'),
    slug: z.string().trim().min(1).regex(KEBAB_CASE_PATTERN, 'slug must use kebab-case'),
    name: LocalizedStringSchema,
    description: LocalizedStringSchema,
    category: z.enum(TOOL_CATEGORY_SLUGS),
    icon: NonBlankStringSchema,
    component: NonBlankStringSchema,
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
      .array(NonBlankStringSchema)
      .refine(
        (arr) =>
          arr.some((t) => /[A-Za-z]/.test(t)) &&
          arr.some((t) => /[\u0600-\u06FF]/.test(t)),
        'keywords must include at least one Latin-script term and one Arabic-script term',
      ),
    inputs: z.array(NonBlankStringSchema).min(1),
    outputs: z.array(NonBlankStringSchema).min(1),
    evidence: DataFlowEvidenceSchema,
    createdAt: NonBlankStringSchema.optional(),
    updatedAt: NonBlankStringSchema.optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const { privacy, retention, evidence } = val;

    if (val.route !== `/[locale]/tools/${val.slug}`) {
      ctx.addIssue({
        code: 'custom',
        message: `route must resolve to /[locale]/tools/${val.slug}`,
        path: ['route'],
      });
    }

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
