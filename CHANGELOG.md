# Changelog

All notable changes to QuickShed will be documented in this file.

The format follows Keep a Changelog, and this project uses semantic versioning once public releases begin.

## [Unreleased]

### Changed

- Set the release identity to v0.6.0.
- Standardized release checks on npm and Chromium Playwright smoke tests to match GitHub Actions.
- Corrected public security and repository links to match implemented controls and the official GitHub repository.

### Added

- Release incident record and dependency audit policy for v0.6.0.

### Security

- Closed CodeQL XSS findings by rendering JSON tokens as React text nodes, decoding HTML entities without a DOM sink, and validating blog URL segments.
- Removed public release archives from the static site source.
- Added a public asset guard that blocks archives, `.env` files, large files, and internal folders under `public/`.
- Added a tracked-path guard for private and internal operational material.
- Extended the public boundary guard across the candidate branch's commit history.
- Escaped Markdown and JSON formatter output before rendering highlighted HTML.
- Replaced the math equation solver `new Function` evaluator with a parser.
- Replaced non-cryptographic password and PIN randomness with Web Crypto.

### Fixed

- Generated canonical locale-aware tool share URLs.
- Made `Ctrl+K` handling case-insensitive.
- Avoided a Radix mobile menu hydration mismatch in the header.

### Added

- QuickShed Playwright smoke tests for desktop Chromium, mobile Chromium, service-worker-safe navigation, archive blocking, canonical sharing, RTL, and XSS regressions.
- Release readiness audit and v0.6.0 launch plan.
- GitHub governance templates for issues, pull requests, code ownership, security, and Dependabot.
