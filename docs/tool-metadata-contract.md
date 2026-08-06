# Tool Metadata and Privacy Contract

This document describes the metadata contract used by QuickShed v0.6.0 and
the checks contributors should run when metadata, privacy copy, or disclosure
behavior changes. It documents the current implementation; the local
`specs/` and `.specify/` artifacts remain local planning records and are not
published by this document.

## Source of truth and current inventory

Each tool is defined in one JSON file under [`content/tools/`](../content/tools/).
The runtime index at [`content/tools-index.json`](../content/tools-index.json)
must remain JSON-equivalent to those source definitions. The index is an index,
not an additional tool.

The current source-derived inventory is:

| Measure | Current value |
| --- | ---: |
| Tool JSON definitions | 90 |
| Runtime index entries | 90 |
| Categories | 11 |
| Privacy: `local` / `file-only` / `storage` / `api` | 74 / 12 / 4 / 0 |
| Offline: `full` / `partial` / `unavailable` | 90 / 0 / 0 |
| Retention: `none` / `session` / `browser-storage` / `external` | 86 / 0 / 4 / 0 |
| Risk: `low` / `medium` / `high` | 86 / 4 / 0 |
| Declared network egress: `none` | 90 |

The exact count is checked from `content/tools/`, reconciled against the
runtime index, and checked against product and communication surfaces by
[`npm run check:tool-count`](../package.json). That check rejects stale product
or communication claims that count the runtime index as a tool. Explanatory
local specification text is intentionally outside that product-claim scan; it
does not change the source-derived count.

## Metadata fields

The schema in [`src/lib/tool-schema.ts`](../src/lib/tool-schema.ts) is the
canonical field contract. Every definition declares:

| Field | Contract |
| --- | --- |
| `id` | Non-empty kebab-case identifier. |
| `slug` | Non-empty kebab-case route slug used by the tool route. |
| `name` | Non-empty localized object with both `en` and `ar` values. |
| `description` | Non-empty localized object with both `en` and `ar` values. |
| `category` | One value from the fixed taxonomy in `src/lib/tool-taxonomy.ts`. |
| `icon` | Non-empty icon name used by the tool card. |
| `component` | Registered dynamic tool component with a matching source file. |
| `route` | `/[locale]/tools/<slug>`, generated for both `/en` and `/ar`. |
| `privacy` | One value from the privacy enumeration below. |
| `offline` | One value from the offline enumeration below. |
| `retention` | One value from the retention enumeration below. |
| `riskLevel` | One value from the risk enumeration below. |
| `keywords` | Non-empty strings containing both Latin-script and Arabic-script terms. |
| `inputs` | At least one non-empty description of accepted input. |
| `outputs` | At least one non-empty description of produced output. |
| `evidence` | Checkable data-flow evidence described below. |
| `createdAt`, `updatedAt` | Optional non-empty audit strings for source history. |

The route pattern is a literal `[locale]` placeholder in metadata. The shared
tool route page expands it to both supported locales through
`generateStaticParams`; it is not a literal URL a user should paste.

## Enumerations and privacy semantics

### Privacy

| Value | Meaning |
| --- | --- |
| `local` | Processing is browser-local. Inputs and outputs do not leave the device. |
| `file-only` | User-selected files are processed on-device and are not uploaded. |
| `storage` | Processing is browser-local and data is persisted in on-device browser storage. |
| `api` | Data is sent to an external API; the destination, data, purpose, and consent path must be declared. |

Non-API tools must declare `evidence.networkEgress: "none"`. An `api` tool
must declare an endpoint object instead and must have a real consent-gate
reference. The current inventory contains no production `api` tool.

### Offline availability

| Value | Meaning |
| --- | --- |
| `full` | The tool's complete behavior works without a network connection. |
| `partial` | Core behavior works offline, while documented features may be limited. |
| `unavailable` | The core behavior requires a network connection. |

### Retention

| Value | Meaning |
| --- | --- |
| `none` | Nothing is retained beyond the active processing step. |
| `session` | Data is retained only for the current browser session. |
| `browser-storage` | Data persists in on-device browser storage across sessions. |
| `external` | Data may be retained by an external service; only valid with `privacy: api`. |

The validator enforces the privacy/retention matrix:

- `storage` requires `browser-storage`.
- `local` and `file-only` allow only `none` or `session`.
- `api` may use any retention value when it matches actual behavior.

### Risk level

Risk is a classification and disclosure aid, not an account, payment, or
access gate.

| Value | Meaning |
| --- | --- |
| `low` | No sensitive user data and negligible safety or misuse impact. |
| `medium` | Ordinary user content or on-device persistence; impact remains within the browser. |
| `high` | Sensitive data or an external path where misuse or a label error could expose data beyond the device. |

## Data-flow evidence

The `evidence` object records why the privacy label matches the implementation.
It contains:

- `inspectedCodePaths`: one or more reviewed component or call-path entries.
- `networkEgress`: `"none"`, or an object with `endpoint`, `data`, and `purpose`.
- `networkEgressBasis`: optional explanation of the network check.
- `storagePersistenceTargets`: browser or external persistence target, or an
  explicit none value.
- `consentGateReference`: the consent affordance for an API path, or an
  explicit not-applicable value for on-device tools.
- `auditBasis`: the basis of the review.
- `sourceRevision`: the source snapshot or revision used for the audit.

Evidence is a review artifact, not executable runtime behavior. It must not
contain secrets, tokens, credentials, or environment values.

## Disclosure UX

The shared [`PrivacyDisclosure`](../src/components/PrivacyDisclosure.tsx)
component is rendered by the tool-use gate in
[`ToolView.tsx`](../src/components/views/ToolView.tsx) before the tool content
mounts.

Before use, the disclosure shows:

- privacy handling;
- offline availability; and
- retention behavior.

The copy is localized through `messages/en.json` and `messages/ar.json`, with
LTR/RTL direction matching the selected locale. The disclosure moves focus to
its heading and uses an announced region so keyboard and assistive-technology
users encounter the gate before the tool.

For `api` metadata, the disclosure additionally shows the external destination,
the declared data, and the purpose. The continue control stays disabled until
the user checks the consent box. Continuing mounts the tool; cancelling invokes
the caller's cancel path while leaving the tool content unmounted.

There are currently no live production API tools. Any future API tool must add
its endpoint evidence, bilingual disclosure behavior, explicit consent path,
and focused tests before it can be treated as release-ready.

## Validation workflow

Run the narrow checks after a metadata or disclosure change, then run the full
release gate:

```bash
npm run validate:tools
npm run test:tool-fixtures
npm run check:tool-count
npm run test:tool-count
npm run release:check
```

The checks have distinct responsibilities:

- `validate:tools` parses every source definition, validates the schema and
  structural references, checks the shared route and component files, and
  verifies source/index parity.
- `test:tool-fixtures` exercises positive coverage for every enum and negative
  cases for malformed metadata and consistency failures.
- `check:tool-count` reconciles the source count with the index and scans
  product/communication surfaces for stale index-inclusive count claims.
- `test:tool-count` protects both the passing reconciliation and the required
  count-drift/stale-claim failure paths.
- `release:check` runs the public-asset guard, metadata validation, parity and
  fixture checks, count reconciliation, lint, and typecheck; then it builds the
  production output before running the build-provenance and client-boundary
  checks, production audit, and Chromium desktop/mobile Playwright tests.

When user-facing disclosure or metadata copy changes, keep English and Arabic
keys aligned and verify both `/en` and `/ar`. Do not add or remove tools,
introduce remote processing, reintroduce Prisma, add runtime database/cloud
capability, or publish the local `specs/` and `.specify/` artifacts as part of
this contract.
