# Dependency Audit Policy

Date: 2026-08-01
Release target: v0.6.0

## Policy

QuickShed uses npm as the official package manager for release work. `package-lock.json` is the release lockfile.

The release gate is:

```bash
npm run release:check
```

The release gate fails on critical production dependency advisories through:

```bash
npm audit --omit=dev --audit-level=critical
```

High, moderate, and low advisories are tracked through GitHub Dependabot alerts and reviewed before each release. They block a release when they affect a public runtime path, have a practical browser-origin exploit path, or have a compatible non-breaking fix available.

## Historical v0.6.0 Baseline

The earlier audit snapshot is preserved as historical evidence. Before the owner-approved Prisma removal and transitive dependency remediation, the production audit reported **15 vulnerabilities**: 1 critical, 6 high, 7 moderate, and 1 low. The release gate failed at its critical audit stage.

At that time, Prisma was inactive tooling/scaffolding rather than a public runtime path. The owner-approved removal is complete; Prisma is no longer a current QuickShed dependency, configuration, schema, or runtime capability. The old Prisma-related finding must not be read as a current exception.

## Current v0.6.0 Decision

The current local production audit after remediation is **0 vulnerabilities**: 0 critical, 0 high, 0 moderate, and 0 low. The compatible resolutions are recorded in the local QS-SPEC-001 evidence artifact and lockfile:

- Next's nested `postcss` resolves to `8.5.25`.
- Next's optional `sharp` resolves to the root `sharp@0.35.3` through the global npm override.
- Production `picomatch` resolves to `4.0.5`; the unrelated `micromatch` 2.x API edge remains on `picomatch@2.3.2`.
- `gray-matter` resolves its 3.x `js-yaml` API to `3.15.1`.
- The direct `pdfjs-dist` dependency resolves to `6.2.108`, closing
  `GHSA-hq66-cqwq-w95j` (arbitrary JavaScript execution when opening a
  malicious PDF); the semver-major upgrade is covered by the bilingual PDF
  text-extraction browser regression test.

Future paid features, database/cloud capability, and Android/native app work remain deferred to a separate approved spec. This remediation introduces no such capability and does not restore Prisma.
