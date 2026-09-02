# Security Policy

QuickShed is a browser toolbox. Security reports should describe the affected route or tool, the observable impact, reproduction steps, and any relevant browser or operating-system context.

## Reporting a vulnerability

Please use GitHub's private vulnerability-reporting channel rather than posting sensitive details in a public issue. Do not include real credentials, tokens, personal data, or sensitive tool inputs in a report. If a report needs a sample, use a synthetic value.

## Data-handling boundary

Every tool page displays a data-handling badge:

- **Local** and **File-only** tools process input in the browser without tool persistence.
- **On-device** tools may save selected data in browser storage.
- **API** tools use an external service and must disclose the transfer before it occurs.

The current catalog does not declare external API egress. These statements describe tool behavior; they are not a claim about routine request logs held by a hosting provider.

## Security controls

The application uses a restrictive content security policy and related security headers. User-provided text is rendered as text or sanitized output rather than as executable markup. Public asset checks prevent archives, environment files, oversized files, and internal folders from entering the static site.

The repository also runs regression checks for unsafe rendering, public-boundary violations, and public assets. Dependency advisories are tracked through Dependabot and the production audit gate.

## Release verification

Before a release candidate is published, run:

```bash
npm run release:check
```

This command runs the public-boundary guards, security regressions, public-asset guard, lint, type checking, production build, critical production dependency audit, and desktop/mobile Chromium tests. A passing local check does not by itself authorize publication or deployment.

## Supported versions

The repository currently identifies the v0.6.0 release line. Security fixes are evaluated against the current branch and the latest published release according to project capacity.

## Scope

This policy covers the QuickShed repository and its public web application. Third-party browsers, operating systems, hosting infrastructure, and dependencies remain subject to their own security processes.
