# Documentation

This directory contains public reference material for QuickShed. Runtime behavior is determined by the application source and current runtime evidence. The tool metadata contract defines descriptor shape, while the localized Privacy and Terms pages describe public policy.

## Current guidance

- [Contributing](../CONTRIBUTING.md): local development, copy rules, and validation.
- [Security policy](../SECURITY.md): reporting and release security checks.
- [Dependency audit policy](security/dependency-audit-policy.md): how dependency advisories affect releases.
- [Privacy Policy](https://quickshed.vercel.app/en/privacy): data handling and browser storage.
- [Terms of Service](https://quickshed.vercel.app/en/terms): service terms and use limits.
- [Release checks](../package.json): the `release:check` script is the canonical local aggregate gate.

## Product behavior

Tool pages expose one of four data-handling classes: Local, File-only, On-device, or API. The class belongs to the individual tool; it should not be generalized into a promise about every route. These public labels should be checked against the current implementation and runtime evidence. Selected static assets may be cached, but cached assets do not guarantee offline navigation.

The English and Arabic interfaces are maintained together. Arabic routes use right-to-left direction and English routes use left-to-right direction.

## Historical records

The files below preserve dated project context. They are not current release status or technical authority:

- [v0.6.0 release checklist](roadmap/v0.6.0-release-checklist.md)
- [v0.6.0 launch plan](roadmap/v0.6.0-launch-plan.md)
- [v0.6.0 readiness audit](audits/2026-06-21-v0.6.0-readiness-audit.md)
- [Public archive incident record](security/2026-06-21-public-archive-incident.md)

For current behavior, use the source and run `npm run release:check`.
