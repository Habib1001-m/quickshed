# Changelog

All notable changes to QuickShed will be documented in this file.

The format follows Keep a Changelog, and this project uses semantic versioning once public releases begin.

## [Unreleased]

### Added

- Local-only bilingual star ratings with reload, SPA-navigation, Arabic, and mobile coverage; ratings never leave the device and can be removed by selecting the active star again.
- The tool metadata and privacy contract, fixture coverage, count reconciliation, and build-provenance release checks.
- Locale-aware category and blog sitemap entries, localized category SSR fallback content, social metadata, and `noindex,follow` for personal Favorites pages.
- Locale-aware 404 handling for unknown `/en/...` and `/ar/...` routes with a regression suite.
- QuickShed Playwright smoke tests for desktop Chromium, mobile Chromium, service-worker-safe navigation, archive blocking, canonical sharing, RTL, and XSS regressions.
- Release incident record and dependency audit policy for v0.6.0.
- Release readiness audit and v0.6.0 launch plan.
- GitHub governance templates for issues, pull requests, code ownership, security, and Dependabot.

### Changed

- Set the release identity to v0.6.0.
- Standardized release checks on npm and Chromium Playwright smoke tests to match GitHub Actions, including metadata parity, fixture, count, client-boundary, and build-provenance checks.
- Corrected public security and repository links to match implemented controls and the official GitHub repository.
- Clarified privacy and offline wording so it describes application behavior separately from hosting-provider requests and static-asset Service Worker caching.
- Made the release gate build before inspecting generated client-boundary and provenance evidence, added a server-rendered localized 404 regression check, and aligned privacy/storage disclosures and 404 copy with the bilingual message catalogs.
- Added restrictive CSP directives for objects, base URLs, form targets, and framing.

### Security

- Removed public release archives from the static site source.
- Added a public asset guard that blocks archives, `.env` files, large files, and internal folders under `public/`.
- Escaped Markdown and JSON formatter output before rendering highlighted HTML.
- Replaced the math equation solver `new Function` evaluator with a parser.
- Replaced non-cryptographic password and PIN randomness with Web Crypto.

### Fixed

- Generated canonical locale-aware tool share URLs.
- Made `Ctrl+K` handling case-insensitive.
- Avoided a Radix mobile menu hydration mismatch in the header.
