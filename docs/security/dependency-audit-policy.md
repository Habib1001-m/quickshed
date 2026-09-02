# Dependency audit policy

This document defines the production dependency check used by QuickShed. It is a policy, not a live vulnerability report.

## Release gate

The repository's canonical release command runs:

```bash
npm run audit:release
```

That script is equivalent to:

```bash
npm audit --omit=dev --audit-level=critical
```

A production dependency advisory rated critical blocks the release check. Lower-severity advisories remain visible to maintainers and are reviewed according to runtime exposure, exploitability, available fixes, and whether the affected package is shipped to production.

## Maintenance

Dependabot opens dependency update pull requests according to `.github/dependabot.yml`. Review the lockfile and the resulting application behavior together; do not accept a version update solely because it removes one advisory.

Do not run `npm audit fix --force` as a routine release step. A breaking update needs its own review, test run, and changelog entry.

## Reading status

For the current dependency state, run the audit command in the exact revision under review and inspect the CI result. Historical advisory counts in dated documents are snapshots and must not be treated as current status.
