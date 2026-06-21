# Dependency Audit Policy

Date: 2026-06-21
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

## Current v0.6.0 Decision

Dependency remediation reduced open GitHub Dependabot alerts from 42 to 12. The remaining advisories require dependency-owner fixes, breaking downgrades, or transitive changes that are not suitable for a release-day forced update.

Accepted for v0.6.0 with follow-up tracking:

- `@hono/node-server` via Prisma tooling: development/tooling path, no public server route in QuickShed.
- `js-yaml` via editor/content tooling: no current public YAML upload or parse path.
- `@babel/core`, `diff`, `picomatch`, `minimatch`, `flatted`, `postcss`, and `uuid` transitive advisories: tracked in Dependabot and npm audit; remediate when compatible upstream releases are available.

This acceptance must be revisited before any v0.6.x patch release and before promotion copy claims stronger audit guarantees.
